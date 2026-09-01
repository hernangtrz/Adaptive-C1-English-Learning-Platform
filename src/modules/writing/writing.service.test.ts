import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { WritingService } from "./writing.service";
import { C1_WRITING_PROMPTS } from "./writing-seed";
import { prisma } from "@/db/prisma";

describe("WritingService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `writing_test_${Date.now()}@example.com`,
        name: "Writing Tester",
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
    it("should retrieve all 4 C1 writing genres", () => {
      const prompts = WritingService.getWritingPrompts();
      expect(prompts.length).toBe(4);
      const categories = prompts.map((p) => p.category);
      expect(categories).toContain("EXECUTIVE_MEMO");
      expect(categories).toContain("PERSUASIVE_PROPOSAL");
      expect(categories).toContain("TECHNICAL_POST_MORTEM");
      expect(categories).toContain("ARGUMENTATIVE_ESSAY");
    });
  });

  describe("Written Composition Evaluation", () => {
    const prompt = C1_WRITING_PROMPTS[0]; // Executive Memo ("mitigate", "bear in mind", "paramount")

    it("should evaluate a formal C1 executive memo containing all target concepts and discourse markers", () => {
      const text =
        "In light of recent platform scalability bottlenecks, modernizing our monolithic codebase is of paramount importance. Notwithstanding initial migration overhead, decomposing services into domain boundaries will decisively mitigate long-term systemic risks. Furthermore, we must bear in mind that maintaining developer velocity requires modular test isolation.";

      const result = WritingService.evaluateWrittenSubmission(prompt, text);

      expect(result.isCorrect).toBe(true);
      expect(result.accuracyScore).toBeGreaterThanOrEqual(0.75);
      expect(result.targetConceptsFound).toContain("mitigate");
      expect(result.targetConceptsFound).toContain("bear in mind");
      expect(result.targetConceptsFound).toContain("paramount");
      expect(result.targetConceptsMissing).toHaveLength(0);
      expect(result.cohesionMetrics.discourseMarkerCount).toBeGreaterThanOrEqual(2);
      expect(result.registerUpgrades).toHaveLength(0);
    });

    it("should detect informal colloquialisms and suggest C1 upgrades", () => {
      const text =
        "We have a lot of issues with the server. We should make sure to fix the problem quickly because it is really good for users.";

      const result = WritingService.evaluateWrittenSubmission(prompt, text);

      expect(result.isCorrect).toBe(false);
      expect(result.registerUpgrades.length).toBeGreaterThanOrEqual(2);
      const informalPhrases = result.registerUpgrades.map((u) => u.informalPhrase);
      expect(informalPhrases).toContain("a lot of");
      expect(informalPhrases).toContain("make sure");
    });
  });

  describe("Atomic Database Writing Review Submission", () => {
    it("should submit a writing review and record WRITING production evidence in Supabase", async () => {
      const prompt = C1_WRITING_PROMPTS[0];
      const text =
        "In light of platform bottlenecks, modernizing our architecture is of paramount importance. Notwithstanding initial migration overhead, this strategy will decisively mitigate systemic risks. Furthermore, we must bear in mind that modularity safeguards developer velocity.";

      const { evaluation, submission } = await WritingService.submitWritingReview(
        testUserId,
        prompt.id,
        text
      );

      expect(evaluation.isCorrect).toBe(true);
      expect(submission.success).toBe(true);
      expect(submission.evidence.source).toBe("WRITING");
      expect(submission.evidence.dimension).toBe("PRODUCTION");
      expect(submission.item.productionMastery).toBeGreaterThan(0.4);
    });
  });
});
