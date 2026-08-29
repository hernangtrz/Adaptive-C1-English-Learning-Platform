import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GrammarService } from "./grammar.service";
import { C1_GRAMMAR_TRANSFORMATIONS, C1_GRAMMAR_ERRORS } from "./grammar-seed";
import { prisma } from "@/db/prisma";

describe("GrammarService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `grammar_test_${Date.now()}@example.com`,
        name: "Grammar Tester",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  describe("Category Structure", () => {
    it("should retrieve all 5 C1 grammar tracks", () => {
      const tracks = GrammarService.getGrammarTracks();
      expect(tracks.length).toBe(5);
      const categories = tracks.map((t) => t.category);
      expect(categories).toContain("INVERSION");
      expect(categories).toContain("MIXED_CONDITIONALS");
      expect(categories).toContain("CLEFT_SENTENCES");
      expect(categories).toContain("SUBJUNCTIVE_MODALS");
      expect(categories).toContain("PARTICIPLE_CLAUSES");
    });
  });

  describe("Transformation Evaluation", () => {
    const invExercise = C1_GRAMMAR_TRANSFORMATIONS[0]; // Rarely have I witnessed...

    it("should evaluate exact sentence transformation with 1.0 score", () => {
      const result = GrammarService.evaluateTransformation(
        invExercise,
        "Rarely have I witnessed such exceptional dedication from a team."
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(1.0);
    });

    it("should award partial high score when key inverted phrase is present", () => {
      const result = GrammarService.evaluateTransformation(
        invExercise,
        "Rarely have I witnessed such extraordinary effort."
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(0.85);
    });

    it("should penalize non-inverted word order in negative inversion", () => {
      const result = GrammarService.evaluateTransformation(
        invExercise,
        "Rarely I have witnessed such exceptional dedication."
      );
      expect(result.isCorrect).toBe(false);
      expect(result.accuracyScore).toBe(0.3);
      expect(result.feedback).toContain("invert");
    });
  });

  describe("Error Identification Evaluation", () => {
    const errorExercise = C1_GRAMMAR_ERRORS[0]; // Seldom we have observed -> Seldom have we observed

    it("should evaluate exact corrected sentence as 1.0", () => {
      const result = GrammarService.evaluateErrorCorrection(
        errorExercise,
        "Seldom have we observed such rapid adoption of a new framework."
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(1.0);
    });

    it("should evaluate target correction fragment as correct", () => {
      const result = GrammarService.evaluateErrorCorrection(
        errorExercise,
        "have we observed"
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBeGreaterThanOrEqual(0.75);
    });
  });

  describe("Atomic Database Review Submission", () => {
    it("should submit a grammar review and record GRAMMAR_EXERCISE evidence in Supabase", async () => {
      const exercise = C1_GRAMMAR_TRANSFORMATIONS[0];
      const submission = await GrammarService.submitGrammarReview(
        testUserId,
        exercise.id,
        "Rarely have I witnessed such exceptional dedication from a team.",
        1.0,
        true,
        0
      );

      expect(submission.success).toBe(true);
      expect(submission.evidence.source).toBe("GRAMMAR_EXERCISE");
      expect(submission.evidence.score).toBe(1.0);
      expect(submission.item.productionMastery).toBeGreaterThan(0.5);
      expect(submission.review.reviewType).toBe("SENTENCE_BUILD");
    });
  });
});
