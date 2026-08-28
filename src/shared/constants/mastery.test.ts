import { describe, it, expect } from "vitest";
import { MASTERY_WEIGHTS, MASTERY_THRESHOLDS, PRIORITY_WEIGHTS } from "./mastery";

describe("Mastery Constants & Config", () => {
  it("should have mastery weights summing to 1.0", () => {
    const sum =
      MASTERY_WEIGHTS.recognition +
      MASTERY_WEIGHTS.recall +
      MASTERY_WEIGHTS.production;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("should prioritize production as highest weight (0.50)", () => {
    expect(MASTERY_WEIGHTS.production).toBe(0.5);
    expect(MASTERY_WEIGHTS.recall).toBe(0.3);
    expect(MASTERY_WEIGHTS.recognition).toBe(0.2);
  });

  it("should have progressive thresholds for mastery transitions", () => {
    expect(MASTERY_THRESHOLDS.MASTERED.production).toBeGreaterThanOrEqual(
      MASTERY_THRESHOLDS.ACTIVE.production
    );
    expect(MASTERY_THRESHOLDS.ACTIVE.recall).toBeGreaterThanOrEqual(
      MASTERY_THRESHOLDS.RECALLABLE.recall
    );
    expect(MASTERY_THRESHOLDS.RECALLABLE.recognition).toBeGreaterThanOrEqual(
      MASTERY_THRESHOLDS.RECOGNIZED.recognition
    );
  });

  it("should have priority weights summing to 1.0", () => {
    const sum =
      PRIORITY_WEIGHTS.due +
      PRIORITY_WEIGHTS.weakness +
      PRIORITY_WEIGHTS.productionGap +
      PRIORITY_WEIGHTS.forgettingRisk +
      PRIORITY_WEIGHTS.recentError;
    expect(sum).toBeCloseTo(1.0, 5);
  });
});
