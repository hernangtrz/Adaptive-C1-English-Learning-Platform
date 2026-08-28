import { prisma } from "@/db/prisma";
import { UserLearningItem, LearningEvidence, MasteryState, Prisma } from "@prisma/client";
import { EvidenceInput, UserMasteryOverview, MasteryDimensions } from "./types";
import { applyEvidenceToDimension, computeMasteryResult } from "./mastery-calculator";

export class MasteryService {
  /**
   * Records a new learning evidence entry and updates the concept's 3-dimensional
   * mastery scores atomically in PostgreSQL.
   */
  static async recordEvidenceAndUpdateMastery(
    userId: string,
    conceptId: string,
    evidenceInput: EvidenceInput
  ): Promise<{ item: UserLearningItem; evidence: LearningEvidence }> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch or create UserLearningItem
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
            masteryState: MasteryState.DISCOVERED,
            productionGap: 0.0,
          },
        });
      }

      // 2. Update the target dimension based on incoming evidence
      const currentDimensions: MasteryDimensions = {
        recognition: item.recognitionMastery,
        recall: item.recallMastery,
        production: item.productionMastery,
      };

      switch (evidenceInput.dimension) {
        case "RECOGNITION":
          currentDimensions.recognition = applyEvidenceToDimension(
            item.recognitionMastery,
            evidenceInput.score,
            evidenceInput.source
          );
          break;
        case "RECALL":
          currentDimensions.recall = applyEvidenceToDimension(
            item.recallMastery,
            evidenceInput.score,
            evidenceInput.source
          );
          break;
        case "PRODUCTION":
          currentDimensions.production = applyEvidenceToDimension(
            item.productionMastery,
            evidenceInput.score,
            evidenceInput.source
          );
          break;
      }

      // 3. Compute updated overall mastery, state transition, and production gap
      const { overallMastery, masteryState, productionGap } = computeMasteryResult(
        currentDimensions,
        {
          totalSuccessfulReviews: item.successfulReviews,
          fsrsStability: item.fsrsStability ?? undefined,
          fsrsLapses: item.fsrsLapses,
        }
      );

      // 4. Update UserLearningItem with new mastery state
      const updatedItem = await tx.userLearningItem.update({
        where: { id: item.id },
        data: {
          recognitionMastery: currentDimensions.recognition,
          recallMastery: currentDimensions.recall,
          productionMastery: currentDimensions.production,
          overallMastery,
          masteryState,
          productionGap,
          lastPracticedAt: new Date(),
        },
      });

      // 5. Append historical immutable evidence record
      const evidence = await tx.learningEvidence.create({
        data: {
          userLearningItemId: item.id,
          userId,
          conceptId,
          dimension: evidenceInput.dimension,
          source: evidenceInput.source,
          score: evidenceInput.score,
          metadata: (evidenceInput.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
      });

      return {
        item: updatedItem,
        evidence,
      };
    });
  }

  /**
   * Retrieves a high-level mastery overview and skill metrics for a user.
   */
  static async getUserMasteryOverview(userId: string): Promise<UserMasteryOverview> {
    const items = await prisma.userLearningItem.findMany({
      where: { userId },
    });

    const byState: Record<MasteryState, number> = {
      DISCOVERED: 0,
      LEARNING: 0,
      RECOGNIZED: 0,
      RECALLABLE: 0,
      ACTIVE: 0,
      MASTERED: 0,
    };

    let totalRec = 0;
    let totalRecall = 0;
    let totalProd = 0;
    let totalOverall = 0;
    let totalGap = 0;
    let highProductionGapCount = 0;

    for (const item of items) {
      byState[item.masteryState] = (byState[item.masteryState] || 0) + 1;
      totalRec += item.recognitionMastery;
      totalRecall += item.recallMastery;
      totalProd += item.productionMastery;
      totalOverall += item.overallMastery;
      totalGap += item.productionGap;

      if (item.productionGap >= 0.35) {
        highProductionGapCount++;
      }
    }

    const total = items.length;
    const round = (v: number) => (total > 0 ? Math.round((v / total) * 1000) / 1000 : 0);

    return {
      totalItems: total,
      byState,
      averageRecognition: round(totalRec),
      averageRecall: round(totalRecall),
      averageProduction: round(totalProd),
      averageOverallMastery: round(totalOverall),
      averageProductionGap: round(totalGap),
      highProductionGapCount,
      masteredCount: byState.MASTERED,
    };
  }

  /**
   * Retrieves mastery details and recent evidence for a specific user and concept.
   */
  static async getConceptMasterySummary(userId: string, conceptId: string) {
    return prisma.userLearningItem.findUnique({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
      include: {
        concept: true,
        evidence: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }
}
