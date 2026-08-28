import { MasteryState, EvidenceDimension, EvidenceSource } from "@prisma/client";

export interface MasteryDimensions {
  recognition: number; // 0.0 to 1.0
  recall: number;      // 0.0 to 1.0
  production: number;  // 0.0 to 1.0
}

export interface MasteryStateEvaluationContext {
  totalSuccessfulReviews?: number;
  fsrsStability?: number;
  fsrsLapses?: number;
  distinctContextsCount?: number;
}

export interface MasteryCalculationResult {
  overallMastery: number;
  masteryState: MasteryState;
  productionGap: number;
}

export interface EvidenceInput {
  dimension: EvidenceDimension;
  source: EvidenceSource;
  score: number; // 0.0 to 1.0
  metadata?: Record<string, unknown>;
}

export interface UserMasteryOverview {
  totalItems: number;
  byState: Record<MasteryState, number>;
  averageRecognition: number;
  averageRecall: number;
  averageProduction: number;
  averageOverallMastery: number;
  averageProductionGap: number;
  highProductionGapCount: number; // Items where gap >= 0.35 (passive but not active)
  masteredCount: number;
}
