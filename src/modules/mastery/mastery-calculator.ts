import { MasteryState, EvidenceSource } from "@prisma/client";
import {
  MasteryDimensions,
  MasteryCalculationResult,
  MasteryStateEvaluationContext,
} from "./types";
import {
  MASTERY_WEIGHTS,
  MASTERY_THRESHOLDS,
} from "@/shared/constants/mastery";

/**
 * Calculates overall mastery using the configurable weighted formula:
 * Overall = (recognition * 0.20) + (recall * 0.30) + (production * 0.50)
 */
export function calculateOverallMastery(
  dimensions: MasteryDimensions,
  weights: typeof MASTERY_WEIGHTS = MASTERY_WEIGHTS
): number {
  const rec = Math.max(0, Math.min(1, dimensions.recognition));
  const recall = Math.max(0, Math.min(1, dimensions.recall));
  const prod = Math.max(0, Math.min(1, dimensions.production));

  const weightedSum =
    rec * weights.recognition +
    recall * weights.recall +
    prod * weights.production;

  return Math.round(Math.max(0, Math.min(1, weightedSum)) * 10000) / 10000;
}

/**
 * Calculates the production gap between recall (passive/semi-active retrieval)
 * and production (spontaneous active generation):
 * productionGap = Math.max(0, recall - production)
 */
export function calculateProductionGap(
  recall: number,
  production: number
): number {
  const clampedRecall = Math.max(0, Math.min(1, recall));
  const clampedProd = Math.max(0, Math.min(1, production));
  const gap = Math.max(0, clampedRecall - clampedProd);

  return Math.round(gap * 10000) / 10000;
}

/**
 * Evaluates evidence-driven mastery state transitions following the platform hierarchy:
 * DISCOVERED ➔ LEARNING ➔ RECOGNIZED ➔ RECALLABLE ➔ ACTIVE ➔ MASTERED
 */
export function determineMasteryState(
  dimensions: MasteryDimensions,
  context?: MasteryStateEvaluationContext
): MasteryState {
  const rec = Math.max(0, Math.min(1, dimensions.recognition));
  const recall = Math.max(0, Math.min(1, dimensions.recall));
  const prod = Math.max(0, Math.min(1, dimensions.production));

  // Check MASTERED threshold
  // Requirements: Recognition >= 0.90, Recall >= 0.85, Production >= 0.80
  if (
    rec >= MASTERY_THRESHOLDS.MASTERED.recognition &&
    recall >= MASTERY_THRESHOLDS.MASTERED.recall &&
    prod >= MASTERY_THRESHOLDS.MASTERED.production
  ) {
    // Additional robustness check for true language mastery:
    // If context is provided, ensure learner has multiple successful reviews or memory stability
    if (context) {
      const hasEnoughReps = (context.totalSuccessfulReviews ?? 0) >= 3;
      const hasHighStability = (context.fsrsStability ?? 0) >= 7.0;

      // If requirements not met, stay in ACTIVE state
      if (!hasEnoughReps && !hasHighStability) {
        return "ACTIVE";
      }
    }
    return "MASTERED";
  }

  // Check ACTIVE threshold
  // Requirements: Recognition >= 0.85, Recall >= 0.80, Production >= 0.70
  if (
    rec >= MASTERY_THRESHOLDS.ACTIVE.recognition &&
    recall >= MASTERY_THRESHOLDS.ACTIVE.recall &&
    prod >= MASTERY_THRESHOLDS.ACTIVE.production
  ) {
    return "ACTIVE";
  }

  // Check RECALLABLE threshold
  // Requirements: Recognition >= 0.80, Recall >= 0.70
  if (
    rec >= MASTERY_THRESHOLDS.RECALLABLE.recognition &&
    recall >= MASTERY_THRESHOLDS.RECALLABLE.recall
  ) {
    return "RECALLABLE";
  }

  // Check RECOGNIZED threshold
  // Requirements: Recognition >= 0.75
  if (rec >= MASTERY_THRESHOLDS.RECOGNIZED.recognition) {
    return "RECOGNIZED";
  }

  // Check LEARNING state (any non-zero activity)
  if (rec > 0 || recall > 0 || prod > 0) {
    return "LEARNING";
  }

  return "DISCOVERED";
}

/**
 * Updates a dimension's mastery score using Exponential Moving Average (EMA)
 * weighted by evidence source quality.
 */
export function applyEvidenceToDimension(
  currentMastery: number,
  evidenceScore: number,
  source: EvidenceSource
): number {
  const clampedCurrent = Math.max(0, Math.min(1, currentMastery));
  const clampedEvidence = Math.max(0, Math.min(1, evidenceScore));

  // Determine learning rate (alpha) based on evidence source signal strength
  let alpha = 0.3;
  switch (source) {
    case "SPEAKING":
    case "WRITING":
      alpha = 0.35; // High signal for production
      break;
    case "VOCABULARY_REVIEW":
    case "GRAMMAR_EXERCISE":
    case "SHADOWING":
      alpha = 0.3;
      break;
    case "LISTENING":
    case "READING":
      alpha = 0.25; // Passive context exposure
      break;
  }

  // If starting from 0, initialize directly with a weighted starting score
  if (clampedCurrent === 0) {
    return Math.round(clampedEvidence * 0.6 * 10000) / 10000;
  }

  const updated = clampedCurrent * (1 - alpha) + clampedEvidence * alpha;
  return Math.round(Math.max(0, Math.min(1, updated)) * 10000) / 10000;
}

/**
 * Calculates complete mastery metrics (overall, state, gap) from given dimensions.
 */
export function computeMasteryResult(
  dimensions: MasteryDimensions,
  context?: MasteryStateEvaluationContext
): MasteryCalculationResult {
  const overallMastery = calculateOverallMastery(dimensions);
  const masteryState = determineMasteryState(dimensions, context);
  const productionGap = calculateProductionGap(dimensions.recall, dimensions.production);

  return {
    overallMastery,
    masteryState,
    productionGap,
  };
}
