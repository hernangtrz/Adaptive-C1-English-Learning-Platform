import { describe, it, expect } from "vitest";
import {
  calculateOverallMastery,
  calculateProductionGap,
  determineMasteryState,
  applyEvidenceToDimension,
  computeMasteryResult,
} from "./mastery-calculator";
import { MASTERY_WEIGHTS } from "@/shared/constants/mastery";

describe("Mastery Calculator Pure Functions", () => {
  describe("calculateOverallMastery", () => {
    it("should compute overall mastery using the 0.20 / 0.30 / 0.50 formula", () => {
      // Example from specification:
      // Recognition = 0.95, Recall = 0.90, Production = 0.35
      // 0.95*0.20 + 0.90*0.30 + 0.35*0.50 = 0.19 + 0.27 + 0.175 = 0.635
      const dimensions = {
        recognition: 0.95,
        recall: 0.9,
        production: 0.35,
      };

      const result = calculateOverallMastery(dimensions);
      expect(result).toBeCloseTo(0.635, 3);
    });

    it("should return 1.0 when all dimensions are 1.0", () => {
      const dimensions = {
        recognition: 1.0,
        recall: 1.0,
        production: 1.0,
      };

      const result = calculateOverallMastery(dimensions);
      expect(result).toBe(1.0);
    });

    it("should return 0.0 when all dimensions are 0.0", () => {
      const dimensions = {
        recognition: 0.0,
        recall: 0.0,
        production: 0.0,
      };

      const result = calculateOverallMastery(dimensions);
      expect(result).toBe(0.0);
    });

    it("should clamp values outside 0.0 and 1.0", () => {
      const dimensions = {
        recognition: 1.5,
        recall: -0.2,
        production: 1.0,
      };

      // rec clamped to 1.0 (0.2), recall clamped to 0.0 (0.0), prod 1.0 (0.5) => 0.7
      const result = calculateOverallMastery(dimensions);
      expect(result).toBe(0.7);
    });
  });

  describe("calculateProductionGap", () => {
    it("should compute the exact gap between recall and production", () => {
      // Example from specification: Recall = 0.92, Production = 0.40 => Gap = 0.52
      const gap = calculateProductionGap(0.92, 0.4);
      expect(gap).toBeCloseTo(0.52, 4);
    });

    it("should return 0.0 when production is equal to or exceeds recall", () => {
      expect(calculateProductionGap(0.7, 0.7)).toBe(0.0);
      expect(calculateProductionGap(0.5, 0.8)).toBe(0.0);
    });

    it("should never return a negative gap", () => {
      expect(calculateProductionGap(0.2, 0.9)).toBe(0.0);
    });
  });

  describe("determineMasteryState Transitions", () => {
    it("should return DISCOVERED when all dimensions are 0.0", () => {
      const state = determineMasteryState({
        recognition: 0.0,
        recall: 0.0,
        production: 0.0,
      });
      expect(state).toBe("DISCOVERED");
    });

    it("should return LEARNING when any dimension is active but below RECOGNIZED threshold", () => {
      const state = determineMasteryState({
        recognition: 0.5,
        recall: 0.2,
        production: 0.1,
      });
      expect(state).toBe("LEARNING");
    });

    it("should return RECOGNIZED when recognition >= 0.75", () => {
      const state = determineMasteryState({
        recognition: 0.78,
        recall: 0.4,
        production: 0.1,
      });
      expect(state).toBe("RECOGNIZED");
    });

    it("should return RECALLABLE when recognition >= 0.80 and recall >= 0.70", () => {
      const state = determineMasteryState({
        recognition: 0.82,
        recall: 0.74,
        production: 0.3,
      });
      expect(state).toBe("RECALLABLE");
    });

    it("should return ACTIVE when recognition >= 0.85, recall >= 0.80, and production >= 0.70", () => {
      const state = determineMasteryState({
        recognition: 0.88,
        recall: 0.84,
        production: 0.72,
      });
      expect(state).toBe("ACTIVE");
    });

    it("should return MASTERED when recognition >= 0.90, recall >= 0.85, and production >= 0.80", () => {
      const state = determineMasteryState({
        recognition: 0.92,
        recall: 0.88,
        production: 0.84,
      });
      expect(state).toBe("MASTERED");
    });

    it("should enforce context reps requirement for MASTERED when evaluation context is passed", () => {
      const dimensions = {
        recognition: 0.95,
        recall: 0.9,
        production: 0.85,
      };

      // When repetitions are too low and stability is low, stay in ACTIVE
      const prematureMastery = determineMasteryState(dimensions, {
        totalSuccessfulReviews: 1,
        fsrsStability: 2.0,
      });
      expect(prematureMastery).toBe("ACTIVE");

      // When repetitions or stability are sufficient, award MASTERED
      const confirmedMastery = determineMasteryState(dimensions, {
        totalSuccessfulReviews: 5,
        fsrsStability: 12.0,
      });
      expect(confirmedMastery).toBe("MASTERED");
    });
  });

  describe("applyEvidenceToDimension", () => {
    it("should initialize mastery from 0.0 with weighted starting score", () => {
      const initial = applyEvidenceToDimension(0.0, 0.9, "VOCABULARY_REVIEW");
      expect(initial).toBeCloseTo(0.54, 2);
    });

    it("should smooth incoming scores using Exponential Moving Average", () => {
      const updated = applyEvidenceToDimension(0.6, 0.9, "SPEAKING");
      // 0.6 * (1 - 0.35) + 0.9 * 0.35 = 0.39 + 0.315 = 0.705
      expect(updated).toBeCloseTo(0.705, 3);
    });

    it("should apply higher learning weight to SPEAKING and WRITING production", () => {
      const fromSpeaking = applyEvidenceToDimension(0.5, 1.0, "SPEAKING");
      const fromListening = applyEvidenceToDimension(0.5, 1.0, "LISTENING");

      expect(fromSpeaking).toBeGreaterThan(fromListening);
    });
  });

  describe("computeMasteryResult", () => {
    it("should return all metrics in a unified result object", () => {
      const result = computeMasteryResult({
        recognition: 0.9,
        recall: 0.85,
        production: 0.75,
      });

      expect(result.overallMastery).toBeDefined();
      expect(result.masteryState).toBe("ACTIVE");
      expect(result.productionGap).toBeCloseTo(0.1, 4);
    });
  });
});
