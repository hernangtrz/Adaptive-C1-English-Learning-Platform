export type ModalityType =
  | "LEXICAL_MASTERY"
  | "GRAMMAR_PRECISION"
  | "LISTENING_DECODING"
  | "PRODUCTIVE_OUTPUT";

export interface ModalityMasteryScore {
  id: ModalityType;
  title: string;
  scorePercent: number; // 0 to 100
  cefrSubBand: "B2 (Developing)" | "B2+ (Progressing)" | "C1- (Operational)" | "C1 (Mastered)";
  evidenceCount: number;
  description: string;
}

export interface ConversionMetrics {
  totalTrackedConcepts: number;
  totalBottlenecksEver: number;
  activeBottlenecksRemaining: number;
  resolvedBottlenecksCount: number;
  conversionRatePercent: number; // 0 to 100%
}

export interface RetentionIntervalBucket {
  intervalLabel: string; // "1-3 days", "4-7 days", "8-14 days", "15-30 days", ">30 days"
  count: number;
  percentage: number;
}

export interface RetentionMetrics {
  totalFSRSCards: number;
  averageIntervalDays: number;
  estimatedRetentionRatePercent: number;
  buckets: RetentionIntervalBucket[];
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: "MASTERY" | "HABIT" | "CONVERSION" | "OUTPUT";
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercent: number; // 0 to 100
}

export interface ProgressAuditReport {
  userId: string;
  generatedAt: string;
  overallC1ReadinessScore: number;
  readinessBand: string;
  modalities: ModalityMasteryScore[];
  conversion: ConversionMetrics;
  retention: RetentionMetrics;
  milestones: MilestoneBadge[];
  strengths: string[];
  recommendedActions: string[];
}
