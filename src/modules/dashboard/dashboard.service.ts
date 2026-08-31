import { prisma } from "@/db/prisma";
import { DashboardData, WeeklyActivityDay, BottleneckItem } from "./types";
import { MasteryService } from "@/modules/mastery/mastery.service";
import { DailyTrainingService } from "@/modules/training/training.service";
import { FSRSService } from "@/modules/fsrs/fsrs.service";
import { UserMasteryOverview } from "@/modules/mastery/types";

export class DashboardService {
  /**
   * Aggregates all learner metrics, FSRS memory health, C1 readiness index,
   * and activity history for the dashboard cockpit.
   */
  static async getDashboardData(userId: string): Promise<DashboardData | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return null;

    const [
      mastery,
      streak,
      dueItems,
      totalConcepts,
      bottleneckItems,
      recentReviews,
      allReviewsLast7Days,
    ] = await Promise.all([
      MasteryService.getUserMasteryOverview(userId),
      DailyTrainingService.getUserStreakInfo(userId),
      FSRSService.getDueItems(userId, new Date(), 100),
      prisma.learningConcept.count(),
      prisma.userLearningItem.findMany({
        where: {
          userId,
          productionGap: { gte: 0.2 },
        },
        include: { concept: true },
        orderBy: { productionGap: "desc" },
        take: 5,
      }),
      prisma.review.findMany({
        where: { userId },
        include: {
          userLearningItem: {
            include: { concept: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.review.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),
    ]);

    // 1. Calculate C1 Readiness Index
    const c1ReadinessScore = this.calculateC1ReadinessScore(mastery, totalConcepts);

    let readinessBand: DashboardData["readinessBand"] = "Developing (B2)";
    if (c1ReadinessScore >= 85) {
      readinessBand = "Advanced Fluent (C1)";
    } else if (c1ReadinessScore >= 65) {
      readinessBand = "Operational (C1-)";
    } else if (c1ReadinessScore >= 40) {
      readinessBand = "Progressing (B2+)";
    }

    // 2. Format High Gap Bottlenecks
    const highGapBottlenecks: BottleneckItem[] = bottleneckItems.map((b) => ({
      id: b.id,
      conceptId: b.conceptId,
      canonicalForm: b.concept.canonicalForm,
      type: b.concept.type,
      cefrLevel: b.concept.cefrLevel,
      translationEs: b.concept.translationEs,
      recallMastery: b.recallMastery,
      productionMastery: b.productionMastery,
      productionGap: b.productionGap,
    }));

    // 3. Aggregate 7-Day Activity
    const weeklyActivity = this.aggregateWeeklyActivity(allReviewsLast7Days);

    return {
      user,
      mastery,
      streak,
      dueCount: dueItems.length,
      c1ReadinessScore,
      readinessBand,
      totalConceptsInLibrary: totalConcepts,
      highGapBottlenecks,
      recentReviews,
      weeklyActivity,
    };
  }

  /**
   * Computes the normalized C1 Readiness Index (0 to 100).
   * Formula:
   * - 40% based on Average Production Mastery
   * - 30% based on Active/Mastered concepts ratio
   * - 20% based on Average Recall Mastery
   * - 10% based on consistency (reduced penalty for high production gap)
   */
  static calculateC1ReadinessScore(
    mastery: UserMasteryOverview,
    totalConcepts: number
  ): number {
    if (mastery.totalItems === 0) return 10; // Baseline entry score

    const productionFactor = mastery.averageProduction * 40;
    const recallFactor = mastery.averageRecall * 20;

    const activeOrMastered = (mastery.byState.ACTIVE || 0) + (mastery.byState.MASTERED || 0);
    const volumeFactor = Math.min(1.0, activeOrMastered / Math.max(5, Math.min(25, totalConcepts))) * 30;

    const gapPenalty = Math.min(10, mastery.averageProductionGap * 10);
    const consistencyBonus = Math.max(0, 10 - gapPenalty);

    const total = productionFactor + recallFactor + volumeFactor + consistencyBonus;
    return Math.round(Math.max(10, Math.min(100, total)));
  }

  /**
   * Aggregates 7-day activity days.
   */
  private static aggregateWeeklyActivity(
    reviews: Array<{ createdAt: Date }>
  ): WeeklyActivityDay[] {
    const days: WeeklyActivityDay[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];

      const count = reviews.filter(
        (r) => r.createdAt.toISOString().split("T")[0] === dateStr
      ).length;

      days.push({
        date: dateStr,
        dayName,
        count,
        minutesEstimated: Math.round(count * 0.8),
      });
    }

    return days;
  }
}
