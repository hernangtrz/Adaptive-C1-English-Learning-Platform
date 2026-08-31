import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SpeakingService } from "./speaking.service";
import { C1_SPEAKING_PROMPTS } from "./speaking-seed";
import { prisma } from "@/db/prisma";

describe("SpeakingService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `speaking_test_${Date.now()}@example.com`,
        name: "Speaking Tester",
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  describe("Prompts Loading", () => {
    it("should retrieve all 4 C1 speaking scenarios", () => {
      const prompts = SpeakingService.getSpeakingPrompts();
      expect(prompts.length).toBe(4);
      const categories = prompts.map((p) => p.category);
      expect(categories).toContain("EXECUTIVE_DECISION");
      expect(categories).toContain("DEBATE_DISAGREEMENT");
      expect(categories).toContain("STRATEGIC_PITCH");
      expect(categories).toContain("PROBLEM_SOLVING_NARRATIVE");
    });
  });

  describe("Spoken Utterance Evaluation", () => {
    const prompt = C1_SPEAKING_PROMPTS[0]; // Strategic Postponement ("mitigate", "bear in mind", "boil down to")

    it("should evaluate a fluent C1 spoken response containing all mandatory target concepts", () => {
      const transcript =
        "What we must bear in mind is that rushing this deployment would jeopardize system reliability. It essentially boils down to whether we prioritize short-term deadlines over long-term stability. Postponing by two weeks will allow us to decisively mitigate the database bottlenecks.";

      const result = SpeakingService.evaluateSpokenUtterance(prompt, transcript, 20);

      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBeGreaterThanOrEqual(0.75);
      expect(result.targetConceptsFound).toContain("mitigate");
      expect(result.targetConceptsFound).toContain("bear in mind");
      expect(result.targetConceptsFound).toContain("boil down to");
      expect(result.targetConceptsMissing).toHaveLength(0);
      expect(result.fluencyMetrics.wordsPerMinute).toBeGreaterThan(0);
    });

    it("should detect filler words and missing concepts", () => {
      const transcript =
        "Um, like, we have a problem with the database and, you know, we should fix it soon.";

      const result = SpeakingService.evaluateSpokenUtterance(prompt, transcript, 30);

      expect(result.isCorrect).toBe(false);
      expect(result.fluencyMetrics.fillerWordsCount).toBeGreaterThanOrEqual(3);
      expect(result.fluencyMetrics.fillerWordsList).toContain("um");
      expect(result.fluencyMetrics.fillerWordsList).toContain("like");
      expect(result.targetConceptsMissing.length).toBeGreaterThan(0);
    });

    it("should suggest lexical upgrades for basic vocabulary", () => {
      const transcript =
        "It is very important to solve the problem quickly because this is a good idea.";

      const result = SpeakingService.evaluateSpokenUtterance(prompt, transcript, 30);

      expect(result.lexicalUpgrades.length).toBeGreaterThanOrEqual(2);
      const originalPhrases = result.lexicalUpgrades.map((u) => u.originalPhrase);
      expect(originalPhrases).toContain("very important");
      expect(originalPhrases).toContain("solve the problem");
    });
  });

  describe("Atomic Database Speaking Review Submission", () => {
    it("should submit a speaking review and record SPEAKING production evidence in Supabase", async () => {
      const prompt = C1_SPEAKING_PROMPTS[0];
      const transcript =
        "What we must bear in mind is that rushing this deployment would jeopardize our platform integrity. It essentially boils down to whether we prioritize short-term milestones over customer trust. By deferring the launch, we can decisively mitigate these compliance bottlenecks.";

      const { evaluation, submission } = await SpeakingService.submitSpeakingReview(
        testUserId,
        prompt.id,
        transcript,
        40
      );

      expect(evaluation.isCorrect).toBe(true);
      expect(submission.success).toBe(true);
      expect(submission.evidence.source).toBe("SPEAKING");
      expect(submission.evidence.dimension).toBe("PRODUCTION");
      expect(submission.item.productionMastery).toBeGreaterThan(0.4);
    });
  });
});
