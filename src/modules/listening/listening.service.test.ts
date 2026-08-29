import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ListeningService } from "./listening.service";
import { C1_LISTENING_EXERCISES } from "./listening-seed";
import { prisma } from "@/db/prisma";

describe("ListeningService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `listening_test_${Date.now()}@example.com`,
        name: "Listening Tester",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  describe("Tracks Overview", () => {
    it("should return all 4 C1 listening tracks", () => {
      const tracks = ListeningService.getListeningTracks();
      expect(tracks.length).toBe(4);
      const categories = tracks.map((t) => t.category);
      expect(categories).toContain("CONNECTED_SPEECH");
      expect(categories).toContain("FAST_DICTATION");
      expect(categories).toContain("BOARDROOM_COMPREHENSION");
      expect(categories).toContain("SHADOWING_LAB");
    });
  });

  describe("Dictation Transcription Evaluation", () => {
    const ex = C1_LISTENING_EXERCISES[1]; // We should have ruled out that architecture last night without hesitation.

    it("should evaluate exact transcription as 1.0", () => {
      const result = ListeningService.evaluateDictation(
        ex,
        "We should have ruled out that architecture last night without hesitation."
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(1.0);
      expect(result.missedWords).toHaveLength(0);
    });

    it("should normalize contractions (shouldve -> should have) and award 1.0", () => {
      const result = ListeningService.evaluateDictation(
        ex,
        "We shouldve ruled out that architecture last night without hesitation"
      );
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(1.0);
    });

    it("should detect missed words in partial dictation", () => {
      const result = ListeningService.evaluateDictation(
        ex,
        "We ruled out that architecture without hesitation."
      );
      expect(result.accuracyScore).toBeGreaterThan(0.5);
      expect(result.missedWords).toContain("should");
      expect(result.missedWords).toContain("have");
    });
  });

  describe("Comprehension Questionnaire Evaluation", () => {
    const compEx = C1_LISTENING_EXERCISES.find(
      (e) => e.category === "BOARDROOM_COMPREHENSION"
    )!;

    it("should score 1.0 when all multiple choice questions are correct", () => {
      const result = ListeningService.evaluateComprehension(compEx, {
        q1: 1, // correct
        q2: 2, // correct
      });
      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBe(1.0);
    });

    it("should score partial credit when some questions are missed", () => {
      const result = ListeningService.evaluateComprehension(compEx, {
        q1: 1, // correct
        q2: 0, // incorrect
      });
      expect(result.isCorrect).toBe(false);
      expect(result.accuracyScore).toBe(0.5);
    });
  });

  describe("Atomic Database Review Persistence", () => {
    it("should submit a listening review and record LISTENING evidence in Supabase", async () => {
      const ex = C1_LISTENING_EXERCISES[0];
      const submission = await ListeningService.submitListeningReview(
        testUserId,
        ex.id,
        1.0,
        true,
        "RECALL",
        "LISTENING"
      );

      expect(submission.success).toBe(true);
      expect(submission.evidence.source).toBe("LISTENING");
      expect(submission.evidence.score).toBe(1.0);
      expect(submission.item.recallMastery).toBeGreaterThan(0.5);
    });
  });
});
