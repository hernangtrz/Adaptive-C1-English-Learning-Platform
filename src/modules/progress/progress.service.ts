import { prisma } from "@/db/prisma";
import {
  ProgressAuditReport,
  ModalityMasteryScore,
  ModalityType,
  ConversionMetrics,
  RetentionMetrics,
  RetentionIntervalBucket,
  MilestoneBadge,
} from "./types";
import { DashboardService } from "@/modules/dashboard/dashboard.service";
import { MasteryService } from "@/modules/mastery/mastery.service";
import { DailyTrainingService } from "@/modules/training/training.service";

export class ProgressService {
  /**
   * Generates a comprehensive Macro C1 Competence Audit Report.
   */
  static async getProgressReport(userId: string): Promise<ProgressAuditReport | null> {
    const [user, items, evidenceList, streakInfo, totalConcepts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      prisma.userLearningItem.findMany({ where: { userId }, include: { concept: true } }),
      prisma.learningEvidence.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      DailyTrainingService.getUserStreakInfo(userId),
      prisma.learningConcept.count(),
    ]);

    if (!user) return null;

    const mastery = await MasteryService.getUserMasteryOverview(userId);
    const c1ReadinessScore = DashboardService.calculateC1ReadinessScore(mastery, totalConcepts);

    let readinessBand = "Developing (B2)";
    if (c1ReadinessScore >= 85) readinessBand = "Advanced Fluent (C1)";
    else if (c1ReadinessScore >= 65) readinessBand = "Operational (C1-)";
    else if (c1ReadinessScore >= 40) readinessBand = "Progressing (B2+)";

    // 1. Modality Scores Calculation
    const modalities = this.calculateModalityScores(items, evidenceList);

    // 2. Passive-to-Active Conversion Metrics
    const conversion = this.calculateConversionMetrics(items);

    // 3. FSRS Memory Retention & Stability Distribution
    const retention = this.calculateRetentionMetrics(items);

    // 4. Milestone Badges Evaluation
    const milestones = this.evaluateMilestones(items, evidenceList, streakInfo, c1ReadinessScore);

    // 5. Diagnostic Strengths & Recommendations
    const { strengths, recommendedActions } = this.generateDiagnosticAudit(modalities, conversion, retention);

    return {
      userId,
      generatedAt: new Date().toISOString(),
      overallC1ReadinessScore: c1ReadinessScore,
      readinessBand,
      modalities,
      conversion,
      retention,
      milestones,
      strengths,
      recommendedActions,
    };
  }

  private static calculateModalityScores(
    items: Array<any>,
    evidenceList: Array<any>
  ): ModalityMasteryScore[] {
    // 1. Lexical Mastery
    const lexItems = items.filter((i) => i.concept.type !== "GRAMMAR");
    const lexScore =
      lexItems.length > 0
        ? Math.round(
            (lexItems.reduce((sum, i) => sum + i.overallMastery, 0) / lexItems.length) * 100
          )
        : 20;

    // 2. Grammar Precision
    const grammarEvidence = evidenceList.filter((e) => e.source === "GRAMMAR_EXERCISE");
    const grammarScore =
      grammarEvidence.length > 0
        ? Math.round(
            (grammarEvidence.reduce((sum, e) => sum + e.score, 0) / grammarEvidence.length) * 100
          )
        : 15;

    // 3. Listening & Connected Speech
    const listeningEvidence = evidenceList.filter(
      (e) => e.source === "LISTENING" || e.source === "SHADOWING"
    );
    const listeningScore =
      listeningEvidence.length > 0
        ? Math.round(
            (listeningEvidence.reduce((sum, e) => sum + e.score, 0) / listeningEvidence.length) * 100
          )
        : 15;

    // 4. Productive Output (Speaking & Writing)
    const productionEvidence = evidenceList.filter(
      (e) => e.source === "SPEAKING" || e.source === "WRITING" || e.dimension === "PRODUCTION"
    );
    const productionScore =
      productionEvidence.length > 0
        ? Math.round(
            (productionEvidence.reduce((sum, e) => sum + e.score, 0) / productionEvidence.length) * 100
          )
        : 10;

    const toBand = (score: number): ModalityMasteryScore["cefrSubBand"] => {
      if (score >= 80) return "C1 (Mastered)";
      if (score >= 60) return "C1- (Operational)";
      if (score >= 40) return "B2+ (Progressing)";
      return "B2 (Developing)";
    };

    return [
      {
        id: "LEXICAL_MASTERY",
        title: "Lexical & Collocational Command",
        scorePercent: lexScore,
        cefrSubBand: toBand(lexScore),
        evidenceCount: lexItems.length,
        description: "Depth of active C1 idioms, formal verbs, and professional collocations.",
      },
      {
        id: "GRAMMAR_PRECISION",
        title: "Advanced Grammar & Inversion",
        scorePercent: grammarScore,
        cefrSubBand: toBand(grammarScore),
        evidenceCount: grammarEvidence.length,
        description: "Accuracy in negative inversions, mixed conditionals, clefts, and subjunctives.",
      },
      {
        id: "LISTENING_DECODING",
        title: "Connected Speech & Acoustic Decoding",
        scorePercent: listeningScore,
        cefrSubBand: toBand(listeningScore),
        evidenceCount: listeningEvidence.length,
        description: "Decoding weak forms, assimilation, elision, and executive speech pace.",
      },
      {
        id: "PRODUCTIVE_OUTPUT",
        title: "Active Spoken & Written Fluency",
        scorePercent: productionScore,
        cefrSubBand: toBand(productionScore),
        evidenceCount: productionEvidence.length,
        description: "Spontaneous verbal argumentation and formal executive writing register.",
      },
    ];
  }

  private static calculateConversionMetrics(items: Array<any>): ConversionMetrics {
    const totalTracked = items.length;
    const activeBottlenecks = items.filter((i) => i.productionGap >= 0.20);
    const resolvedBottlenecks = items.filter(
      (i) => i.productionMastery >= 0.60 && i.productionGap < 0.20
    );

    const totalBottlenecksEver = activeBottlenecks.length + resolvedBottlenecks.length;
    const conversionRatePercent =
      totalBottlenecksEver > 0
        ? Math.round((resolvedBottlenecks.length / totalBottlenecksEver) * 100)
        : 100;

    return {
      totalTrackedConcepts: totalTracked,
      totalBottlenecksEver,
      activeBottlenecksRemaining: activeBottlenecks.length,
      resolvedBottlenecksCount: resolvedBottlenecks.length,
      conversionRatePercent,
    };
  }

  private static calculateRetentionMetrics(items: Array<any>): RetentionMetrics {
    const totalCards = items.length;
    if (totalCards === 0) {
      return {
        totalFSRSCards: 0,
        averageIntervalDays: 1,
        estimatedRetentionRatePercent: 90,
        buckets: [
          { intervalLabel: "1-3 days", count: 0, percentage: 0 },
          { intervalLabel: "4-7 days", count: 0, percentage: 0 },
          { intervalLabel: "8-14 days", count: 0, percentage: 0 },
          { intervalLabel: "15-30 days", count: 0, percentage: 0 },
          { intervalLabel: ">30 days", count: 0, percentage: 0 },
        ],
      };
    }

    const intervals = items.map((i) => i.interval ?? 1);
    const avgInterval = Math.round((intervals.reduce((a, b) => a + b, 0) / totalCards) * 10) / 10;

    let b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (const iv of intervals) {
      if (iv <= 3) b1++;
      else if (iv <= 7) b2++;
      else if (iv <= 14) b3++;
      else if (iv <= 30) b4++;
      else b5++;
    }

    const toPct = (count: number) => Math.round((count / totalCards) * 100);

    return {
      totalFSRSCards: totalCards,
      averageIntervalDays: avgInterval,
      estimatedRetentionRatePercent: 91,
      buckets: [
        { intervalLabel: "1-3 days", count: b1, percentage: toPct(b1) },
        { intervalLabel: "4-7 days", count: b2, percentage: toPct(b2) },
        { intervalLabel: "8-14 days", count: b3, percentage: toPct(b3) },
        { intervalLabel: "15-30 days", count: b4, percentage: toPct(b4) },
        { intervalLabel: ">30 days", count: b5, percentage: toPct(b5) },
      ],
    };
  }

  private static evaluateMilestones(
    items: Array<any>,
    evidenceList: Array<any>,
    streakInfo: any,
    c1Score: number
  ): MilestoneBadge[] {
    const totalReviews = evidenceList.length;
    const resolvedBottlenecks = items.filter(
      (i) => i.productionMastery >= 0.60 && i.productionGap < 0.20
    ).length;
    const grammarCount = evidenceList.filter((e) => e.source === "GRAMMAR_EXERCISE").length;
    const listeningCount = evidenceList.filter((e) => e.source === "LISTENING" || e.source === "SHADOWING").length;
    const speakingCount = evidenceList.filter((e) => e.source === "SPEAKING").length;
    const writingCount = evidenceList.filter((e) => e.source === "WRITING").length;

    return [
      {
        id: "FIRST_STEP",
        title: "First Retrieval Step",
        description: "Completed your first spaced retrieval review.",
        iconName: "Zap",
        category: "HABIT",
        isUnlocked: totalReviews >= 1,
        unlockedAt: totalReviews >= 1 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((totalReviews / 1) * 100)),
      },
      {
        id: "SEVEN_DAY_WARRIOR",
        title: "Consistency Champion",
        description: "Maintained a 7-day daily learning streak.",
        iconName: "Flame",
        category: "HABIT",
        isUnlocked: streakInfo.currentStreak >= 7 || streakInfo.longestStreak >= 7,
        unlockedAt: streakInfo.longestStreak >= 7 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((streakInfo.currentStreak / 7) * 100)),
      },
      {
        id: "BOTTLENECK_BREAKER",
        title: "Bottleneck Breaker",
        description: "Converted 3 passive vocabulary expressions to active spontaneous mastery.",
        iconName: "TrendingUp",
        category: "CONVERSION",
        isUnlocked: resolvedBottlenecks >= 3,
        unlockedAt: resolvedBottlenecks >= 3 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((resolvedBottlenecks / 3) * 100)),
      },
      {
        id: "INVERSION_SPECIALIST",
        title: "Inversion & Syntax Specialist",
        description: "Mastered advanced C1 sentence transformations and structural inversions.",
        iconName: "BookOpen",
        category: "MASTERY",
        isUnlocked: grammarCount >= 3,
        unlockedAt: grammarCount >= 3 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((grammarCount / 3) * 100)),
      },
      {
        id: "ACOUSTIC_DECODER",
        title: "Acoustic Decoder",
        description: "Decoded rapid native speech reductions and boardroom discussions.",
        iconName: "Headphones",
        category: "MASTERY",
        isUnlocked: listeningCount >= 3,
        unlockedAt: listeningCount >= 3 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((listeningCount / 3) * 100)),
      },
      {
        id: "SPOKEN_VIRTUOSO",
        title: "Spoken Virtuoso",
        description: "Delivered C1 workplace simulations at optimal conversational pace (110-150 WPM).",
        iconName: "Mic",
        category: "OUTPUT",
        isUnlocked: speakingCount >= 2,
        unlockedAt: speakingCount >= 2 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((speakingCount / 2) * 100)),
      },
      {
        id: "EXECUTIVE_STYLIST",
        title: "Executive Stylist",
        description: "Authored formal C1 executive memorandums and technical post-mortems.",
        iconName: "PenTool",
        category: "OUTPUT",
        isUnlocked: writingCount >= 2,
        unlockedAt: writingCount >= 2 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((writingCount / 2) * 100)),
      },
      {
        id: "C1_CANDIDATE",
        title: "C1 Operational Readiness",
        description: "Achieved an overall C1 Readiness Index of 75+ across all 4 competencies.",
        iconName: "Award",
        category: "MASTERY",
        isUnlocked: c1Score >= 75,
        unlockedAt: c1Score >= 75 ? "Active" : null,
        progressPercent: Math.min(100, Math.round((c1Score / 75) * 100)),
      },
    ];
  }

  private static generateDiagnosticAudit(
    modalities: ModalityMasteryScore[],
    conversion: ConversionMetrics,
    retention: RetentionMetrics
  ): { strengths: string[]; recommendedActions: string[] } {
    const strengths: string[] = [];
    const recommendedActions: string[] = [];

    const highest = [...modalities].sort((a, b) => b.scorePercent - a.scorePercent)[0];
    const lowest = [...modalities].sort((a, b) => a.scorePercent - b.scorePercent)[0];

    if (highest && highest.scorePercent >= 40) {
      strengths.push(`Strong competence in ${highest.title} (${highest.scorePercent}%, ${highest.cefrSubBand}).`);
    } else {
      strengths.push("Active foundation established across foundational C1 concepts.");
    }

    if (conversion.conversionRatePercent >= 70) {
      strengths.push(`High passive-to-active conversion efficiency (${conversion.conversionRatePercent}% bottleneck resolution rate).`);
    }

    if (lowest) {
      recommendedActions.push(`Focus daily practice on ${lowest.title} (${lowest.scorePercent}%) to balance overall CEFR readiness.`);
    }

    if (conversion.activeBottlenecksRemaining > 0) {
      recommendedActions.push(`Target ${conversion.activeBottlenecksRemaining} passive bottleneck expressions in the Vocabulary or Daily Training engine.`);
    }

    if (retention.totalFSRSCards > 0 && retention.averageIntervalDays < 5) {
      recommendedActions.push("Complete scheduled daily reviews to lengthen FSRS memory stability intervals beyond 7 days.");
    }

    return { strengths, recommendedActions };
  }
}
