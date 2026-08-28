import { fsrs, createEmptyCard, Card, Rating, Grade, State, RecordLogItem, RecordLog } from "ts-fsrs";
import { prisma } from "@/db/prisma";
import { UserLearningItem, Review } from "@prisma/client";
import {
  FSRSRatingString,
  FSRSSchedulePreview,
  ProcessReviewOptions,
} from "./types";
import { toTsFsrsRating } from "./rating-mapper";

// Initialize FSRS scheduler instance
export const fsrsScheduler = fsrs();

export class FSRSService {
  /**
   * Reconstructs a ts-fsrs Card object from a UserLearningItem database record.
   * If the item is new or uninitialized, returns an empty Card initialized to `now`.
   */
  static toFSRSCard(
    item: Partial<UserLearningItem> | null,
    now: Date = new Date()
  ): Card {
    if (!item || item.fsrsLastReview === null || item.fsrsStability === null || item.fsrsStability === undefined) {
      const empty = createEmptyCard(now);
      return empty;
    }

    return {
      due: item.fsrsDueDate ?? now,
      stability: item.fsrsStability,
      difficulty: item.fsrsDifficulty ?? 5.0,
      elapsed_days: item.fsrsElapsedDays ?? 0,
      scheduled_days: item.fsrsScheduledDays ?? 0,
      learning_steps: 0,
      reps: item.fsrsReps ?? 0,
      lapses: item.fsrsLapses ?? 0,
      state: (item.fsrsState ?? 0) as State,
      last_review: item.fsrsLastReview ?? now,
    };
  }

  /**
   * Converts updated ts-fsrs Card properties back to UserLearningItem schema fields.
   */
  static fromFSRSCard(card: Card) {
    return {
      fsrsState: Number(card.state),
      fsrsDueDate: card.due,
      fsrsStability: card.stability,
      fsrsDifficulty: card.difficulty,
      fsrsElapsedDays: card.elapsed_days,
      fsrsScheduledDays: card.scheduled_days,
      fsrsReps: card.reps,
      fsrsLapses: card.lapses,
      fsrsLastReview: card.last_review,
    };
  }

  /**
   * Returns human-readable state names.
   */
  static getStateName(state: State): string {
    switch (state) {
      case State.New:
        return "New";
      case State.Learning:
        return "Learning";
      case State.Review:
        return "Review";
      case State.Relearning:
        return "Relearning";
      default:
        return "Unknown";
    }
  }

  /**
   * Previews the next review intervals and due dates for all 4 possible ratings.
   */
  static previewNextReviews(
    item: Partial<UserLearningItem> | null,
    now: Date = new Date()
  ): Record<FSRSRatingString, FSRSSchedulePreview> {
    const card = this.toFSRSCard(item, now);
    const repeatResult: RecordLog = fsrsScheduler.repeat(card, now);

    const formatPreview = (ratingNum: Grade, ratingStr: FSRSRatingString): FSRSSchedulePreview => {
      const scheduledItem: RecordLogItem = repeatResult[ratingNum];
      return {
        rating: ratingStr,
        numericRating: ratingNum,
        due: scheduledItem.card.due,
        scheduledDays: scheduledItem.card.scheduled_days,
        stability: scheduledItem.card.stability,
        difficulty: scheduledItem.card.difficulty,
        state: scheduledItem.card.state,
        stateName: this.getStateName(scheduledItem.card.state),
      };
    };

    return {
      AGAIN: formatPreview(Rating.Again, "AGAIN"),
      HARD: formatPreview(Rating.Hard, "HARD"),
      GOOD: formatPreview(Rating.Good, "GOOD"),
      EASY: formatPreview(Rating.Easy, "EASY"),
    };
  }

  /**
   * Computes the next Card state for a given rating without persisting to the database.
   */
  static calculateNextState(
    item: Partial<UserLearningItem> | null,
    rating: FSRSRatingString,
    now: Date = new Date()
  ): RecordLogItem {
    const card = this.toFSRSCard(item, now);
    const numericRating: Grade = toTsFsrsRating(rating);
    const repeatResult: RecordLog = fsrsScheduler.repeat(card, now);
    return repeatResult[numericRating];
  }

  /**
   * Atomically processes and persists an FSRS review in PostgreSQL.
   */
  static async processReview(
    userId: string,
    conceptId: string,
    rating: FSRSRatingString,
    options: ProcessReviewOptions = {}
  ): Promise<{ item: UserLearningItem; review: Review }> {
    const reviewedAt = options.reviewedAt ?? new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Get or create UserLearningItem
      let item = await tx.userLearningItem.findUnique({
        where: {
          userId_conceptId: {
            userId,
            conceptId,
          },
        },
      });

      if (!item) {
        item = await tx.userLearningItem.create({
          data: {
            userId,
            conceptId,
            recognitionMastery: 0.0,
            recallMastery: 0.0,
            productionMastery: 0.0,
            overallMastery: 0.0,
            masteryState: "LEARNING",
            productionGap: 0.0,
          },
        });
      }

      // 2. Compute updated FSRS card state
      const nextSchedule = this.calculateNextState(item, rating, reviewedAt);
      const fsrsFields = this.fromFSRSCard(nextSchedule.card);

      const isSuccessful = rating === "GOOD" || rating === "EASY";

      // 3. Update UserLearningItem
      const updatedItem = await tx.userLearningItem.update({
        where: { id: item.id },
        data: {
          ...fsrsFields,
          totalReviews: { increment: 1 },
          ...(isSuccessful && { successfulReviews: { increment: 1 } }),
          lastPracticedAt: reviewedAt,
        },
      });

      // 4. Create Review record
      const reviewRecord = await tx.review.create({
        data: {
          userLearningItemId: item.id,
          userId,
          rating,
          reviewType: options.reviewType ?? "RECOGNITION",
          timeSpentMs: options.timeSpentMs ?? null,
          evidenceScore: options.evidenceScore ?? (rating === "EASY" ? 1.0 : rating === "GOOD" ? 0.8 : rating === "HARD" ? 0.6 : 0.2),
          createdAt: reviewedAt,
        },
      });

      return {
        item: updatedItem,
        review: reviewRecord,
      };
    });
  }

  /**
   * Queries due items for a user whose FSRS due date is past or equal to `now`.
   */
  static async getDueItems(
    userId: string,
    now: Date = new Date(),
    limit: number = 50
  ) {
    return prisma.userLearningItem.findMany({
      where: {
        userId,
        OR: [
          { fsrsDueDate: { lte: now } },
          { fsrsDueDate: null }, // Unreviewed new items
        ],
      },
      include: {
        concept: true,
      },
      orderBy: [
        { fsrsDueDate: "asc" },
        { createdAt: "asc" },
      ],
      take: limit,
    });
  }
}
