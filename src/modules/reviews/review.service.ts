import { prisma } from "@/db/prisma";
import { UserLearningItem, MasteryState, Prisma } from "@prisma/client";
import {
  ReviewSubmissionInput,
  ReviewSubmissionResult,
  ReviewQueueItem,
  ExerciseType,
} from "./types";
import { scoreToFSRSRating } from "@/modules/fsrs/rating-mapper";
import { FSRSService } from "@/modules/fsrs/fsrs.service";
import {
  applyEvidenceToDimension,
  computeMasteryResult,
} from "@/modules/mastery/mastery-calculator";
import { MasteryDimensions } from "@/modules/mastery/types";

export class ReviewService {
  /**
   * Executes the atomic 11-step Review Transaction in PostgreSQL:
   * 1. Load UserLearningItem
   * 2. Evaluate answer & generate evidence score
   * 3. Update target mastery dimension (Recognition, Recall, or Production)
   * 4. Recalculate overall mastery, state transition, and production gap
   * 5. Determine FSRS rating (AGAIN, HARD, GOOD, EASY) with hint penalties
   * 6. Run FSRS spaced repetition scheduling
   * 7. Save immutable LearningEvidence record
   * 8. Save Review attempt record
   * 9. Update UserLearningItem in database
   * 10. Return updated state to client
   */
  static async processReviewSubmission(
    input: ReviewSubmissionInput
  ): Promise<ReviewSubmissionResult> {
    const reviewedAt = new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Load or create UserLearningItem
      let item = await tx.userLearningItem.findUnique({
        where: {
          userId_conceptId: {
            userId: input.userId,
            conceptId: input.conceptId,
          },
        },
        include: {
          concept: true,
        },
      });

      if (!item) {
        item = await tx.userLearningItem.create({
          data: {
            userId: input.userId,
            conceptId: input.conceptId,
            recognitionMastery: 0.0,
            recallMastery: 0.0,
            productionMastery: 0.0,
            overallMastery: 0.0,
            masteryState: MasteryState.DISCOVERED,
            productionGap: 0.0,
          },
          include: {
            concept: true,
          },
        });
      }

      // 2. Update target dimension with evidence score
      const currentDimensions: MasteryDimensions = {
        recognition: item.recognitionMastery,
        recall: item.recallMastery,
        production: item.productionMastery,
      };

      const source = input.source ?? "VOCABULARY_REVIEW";
      switch (input.dimension) {
        case "RECOGNITION":
          currentDimensions.recognition = applyEvidenceToDimension(
            item.recognitionMastery,
            input.accuracyScore,
            source
          );
          break;
        case "RECALL":
          currentDimensions.recall = applyEvidenceToDimension(
            item.recallMastery,
            input.accuracyScore,
            source
          );
          break;
        case "PRODUCTION":
          currentDimensions.production = applyEvidenceToDimension(
            item.productionMastery,
            input.accuracyScore,
            source
          );
          break;
      }

      // 3. Compute updated mastery metrics
      const { overallMastery, masteryState, productionGap } = computeMasteryResult(
        currentDimensions,
        {
          totalSuccessfulReviews: item.successfulReviews,
          fsrsStability: item.fsrsStability ?? undefined,
          fsrsLapses: item.fsrsLapses,
        }
      );

      // 4. Determine FSRS rating with hint penalties
      const rating = scoreToFSRSRating(input.accuracyScore, {
        hintsUsed: input.hintsUsed ?? 0,
        requiredAssistance: input.requiredAssistance ?? false,
        timeSpentMs: input.timeSpentMs,
      });

      // 5. Run FSRS algorithm
      const nextSchedule = FSRSService.calculateNextState(item, rating, reviewedAt);
      const fsrsFields = FSRSService.fromFSRSCard(nextSchedule.card);

      const isSuccessful = rating === "GOOD" || rating === "EASY";

      // 6. Save immutable LearningEvidence record
      const evidence = await tx.learningEvidence.create({
        data: {
          userLearningItemId: item.id,
          userId: input.userId,
          conceptId: input.conceptId,
          dimension: input.dimension,
          source,
          score: input.accuracyScore,
          metadata: (input.metadata as Prisma.InputJsonValue) ?? {
            exerciseType: input.exerciseType,
            hintsUsed: input.hintsUsed ?? 0,
            userAnswer: input.userAnswer,
          },
          createdAt: reviewedAt,
        },
      });

      // 7. Save Review attempt record
      const review = await tx.review.create({
        data: {
          userLearningItemId: item.id,
          userId: input.userId,
          rating,
          reviewType: input.exerciseType,
          timeSpentMs: input.timeSpentMs ?? null,
          evidenceScore: input.accuracyScore,
          createdAt: reviewedAt,
        },
      });

      // 8. Update UserLearningItem with all updated fields
      const updatedItem = await tx.userLearningItem.update({
        where: { id: item.id },
        data: {
          recognitionMastery: currentDimensions.recognition,
          recallMastery: currentDimensions.recall,
          productionMastery: currentDimensions.production,
          overallMastery,
          masteryState,
          productionGap,
          ...fsrsFields,
          totalReviews: { increment: 1 },
          ...(isSuccessful && { successfulReviews: { increment: 1 } }),
          lastPracticedAt: reviewedAt,
        },
      });

      return {
        success: true,
        rating,
        evidence,
        review,
        item: updatedItem,
        nextReviewDue: nextSchedule.card.due,
        scheduledDays: nextSchedule.card.scheduled_days,
        newMasteryState: masteryState,
        newOverallMastery: overallMastery,
        newProductionGap: productionGap,
        dimensionScore:
          input.dimension === "RECOGNITION"
            ? currentDimensions.recognition
            : input.dimension === "RECALL"
            ? currentDimensions.recall
            : currentDimensions.production,
      };
    });
  }

  /**
   * Builds an active review queue of due and learning items for a user.
   */
  static async getDueReviewQueue(
    userId: string,
    limit: number = 10
  ): Promise<ReviewQueueItem[]> {
    const now = new Date();

    // 1. Query due learning items
    let userItems = await FSRSService.getDueItems(userId, now, limit);

    // 2. If queue is below limit, pull additional unreviewed concepts for onboarding/discovery
    if (userItems.length < limit) {
      const existingConceptIds = userItems.map((i) => i.conceptId);
      const remainingCount = limit - userItems.length;

      const newConcepts = await prisma.learningConcept.findMany({
        where: {
          id: { notIn: existingConceptIds },
        },
        take: remainingCount,
      });

      if (newConcepts.length > 0) {
        const createdItems = await Promise.all(
          newConcepts.map((concept) =>
            prisma.userLearningItem.upsert({
              where: {
                userId_conceptId: {
                  userId,
                  conceptId: concept.id,
                },
              },
              update: {},
              create: {
                userId,
                conceptId: concept.id,
                masteryState: MasteryState.DISCOVERED,
              },
              include: {
                concept: true,
              },
            })
          )
        );
        userItems.push(...createdItems);
      }
    }

    // 3. Transform into structured ReviewQueueItem with adaptive exercise selection
    const queue: ReviewQueueItem[] = [];

    // Gather distractor options for multiple choice
    const allConcepts = await prisma.learningConcept.findMany({
      select: { meaning: true, translationEs: true },
      take: 20,
    });

    for (const item of userItems) {
      const concept = item.concept;
      const examples = Array.isArray(concept.examples)
        ? (concept.examples as Array<{ sentence: string; translationEs: string; context?: string }>)
        : [];
      const primaryExample = examples[0]?.sentence ?? `They decided to ${concept.canonicalForm} without hesitation.`;

      // Adaptive Practice Selection based on current mastery dimensions:
      let suggestedExerciseType: ExerciseType = "RECOGNITION";
      let targetDimension: "RECOGNITION" | "RECALL" | "PRODUCTION" = "RECOGNITION";

      if (item.recognitionMastery < 0.75) {
        // Recognition is weak ➔ Recognition activity
        suggestedExerciseType = "RECOGNITION";
        targetDimension = "RECOGNITION";
      } else if (item.recallMastery < 0.70) {
        // Recognition is good, but recall is weak ➔ Cloze / Recall activity
        suggestedExerciseType = "CLOZE";
        targetDimension = "RECALL";
      } else {
        // Recall is good, but production needs activation ➔ Production activity
        suggestedExerciseType = "SENTENCE_BUILD";
        targetDimension = "PRODUCTION";
      }

      // Generate cloze blank
      const clozeRegex = new RegExp(concept.canonicalForm, "gi");
      const clozeSentence = primaryExample.replace(clozeRegex, "__________");

      // Generate distractors
      const otherMeanings = allConcepts
        .filter((c) => c.meaning !== concept.meaning)
        .map((c) => c.meaning)
        .slice(0, 3);
      const options = [concept.meaning, ...otherMeanings].sort(() => Math.random() - 0.5);

      queue.push({
        item,
        concept,
        suggestedExerciseType,
        targetDimension,
        prompt:
          suggestedExerciseType === "RECOGNITION"
            ? `What is the accurate meaning of "${concept.canonicalForm}"?`
            : suggestedExerciseType === "CLOZE"
            ? "Complete the sentence with the appropriate target expression:"
            : `Produce a natural sentence using "${concept.canonicalForm}":`,
        options: suggestedExerciseType === "RECOGNITION" ? options : undefined,
        correctAnswer: concept.canonicalForm,
        contextSentence: primaryExample,
        translationEs: concept.translationEs,
        clozeSentence,
      });
    }

    return queue;
  }

  /**
   * Retrieves review history for a user.
   */
  static async getUserReviewHistory(userId: string, limit: number = 30) {
    return prisma.review.findMany({
      where: { userId },
      include: {
        userLearningItem: {
          include: {
            concept: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
