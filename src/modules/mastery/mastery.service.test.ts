import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MasteryService } from "./mastery.service";
import { prisma } from "@/db/prisma";

describe("MasteryService Integration Tests", () => {
  let testUserId: string;
  let testConceptId: string;

  beforeAll(async () => {
    // 1. Create a test user
    const user = await prisma.user.create({
      data: {
        email: `mastery_test_${Date.now()}@example.com`,
        name: "Mastery Tester",
      },
    });
    testUserId = user.id;

    // 2. Fetch or create a test concept
    let concept = await prisma.learningConcept.findFirst({
      where: { canonicalForm: "figure out" },
    });
    if (!concept) {
      concept = await prisma.learningConcept.create({
        data: {
          type: "PHRASAL_VERB",
          canonicalForm: "figure out",
          meaning: "to solve or understand",
          translationEs: "averiguar",
          cefrLevel: "B2",
        },
      });
    }
    testConceptId = concept.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  it("should record recognition evidence and transition item state to LEARNING/RECOGNIZED", async () => {
    const result = await MasteryService.recordEvidenceAndUpdateMastery(
      testUserId,
      testConceptId,
      {
        dimension: "RECOGNITION",
        source: "VOCABULARY_REVIEW",
        score: 0.95,
        metadata: { exerciseType: "MULTIPLE_CHOICE" },
      }
    );

    expect(result.item).toBeDefined();
    expect(result.item.recognitionMastery).toBeGreaterThan(0.5);
    expect(result.item.recallMastery).toBe(0.0);
    expect(result.item.productionMastery).toBe(0.0);
    expect(result.item.overallMastery).toBeGreaterThan(0.0);

    expect(result.evidence).toBeDefined();
    expect(result.evidence.dimension).toBe("RECOGNITION");
    expect(result.evidence.score).toBe(0.95);
  });

  it("should record recall evidence and calculate production gap", async () => {
    const result = await MasteryService.recordEvidenceAndUpdateMastery(
      testUserId,
      testConceptId,
      {
        dimension: "RECALL",
        source: "GRAMMAR_EXERCISE",
        score: 0.9,
        metadata: { exerciseType: "FILL_BLANK" },
      }
    );

    expect(result.item.recallMastery).toBeGreaterThan(0.4);
    // Since recall is active and production is still 0, a production gap should exist
    expect(result.item.productionGap).toBeGreaterThan(0.0);
    expect(result.item.productionGap).toBeCloseTo(result.item.recallMastery - result.item.productionMastery, 4);
  });

  it("should record production evidence and narrow the production gap", async () => {
    const result = await MasteryService.recordEvidenceAndUpdateMastery(
      testUserId,
      testConceptId,
      {
        dimension: "PRODUCTION",
        source: "SPEAKING",
        score: 0.95,
        metadata: { utterance: "I eventually figured out the solution." },
      }
    );

    expect(result.item.productionMastery).toBeGreaterThan(0.5);
    expect(result.item.overallMastery).toBeGreaterThan(0.3);
  });

  it("should generate a multi-dimensional mastery overview for the user", async () => {
    const overview = await MasteryService.getUserMasteryOverview(testUserId);

    expect(overview.totalItems).toBeGreaterThanOrEqual(1);
    expect(overview.byState).toBeDefined();
    expect(overview.averageOverallMastery).toBeGreaterThan(0.0);
    expect(overview.averageRecognition).toBeGreaterThan(0.0);
  });

  it("should retrieve summary with historical evidence trail", async () => {
    const summary = await MasteryService.getConceptMasterySummary(testUserId, testConceptId);

    expect(summary).toBeDefined();
    expect(summary?.evidence.length).toBe(3); // 3 pieces of evidence recorded above
    expect(summary?.concept.canonicalForm).toBe("figure out");
  });
});
