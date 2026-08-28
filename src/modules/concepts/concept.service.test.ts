import { describe, it, expect } from "vitest";
import { ConceptService } from "./concept.service";
import { prisma } from "@/db/prisma";

describe("ConceptService Tests", () => {
  it("should list seeded concepts from the database", async () => {
    const result = await ConceptService.listConcepts({ limit: 10 });
    expect(result.concepts.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThanOrEqual(20);
  });

  it("should filter concepts by type correctly", async () => {
    const result = await ConceptService.listConcepts({ type: "PHRASAL_VERB" });
    expect(result.concepts.length).toBeGreaterThan(0);
    for (const c of result.concepts) {
      expect(c.type).toBe("PHRASAL_VERB");
    }
  });

  it("should filter concepts by CEFR level correctly", async () => {
    const result = await ConceptService.listConcepts({ cefrLevel: "C1" });
    expect(result.concepts.length).toBeGreaterThan(0);
    for (const c of result.concepts) {
      expect(c.cefrLevel).toBe("C1");
    }
  });

  it("should search concepts by English canonical form or Spanish translation", async () => {
    const result = await ConceptService.listConcepts({ search: "figure out" });
    expect(result.concepts.length).toBeGreaterThanOrEqual(1);
    expect(result.concepts[0].canonicalForm).toBe("figure out");
  });

  it("should create and retrieve a UserLearningItem for a concept", async () => {
    // 1. Create a dummy test user
    const testUser = await prisma.user.create({
      data: {
        email: `concept_test_${Date.now()}@example.com`,
        name: "Test Learner",
      },
    });

    // 2. Fetch any concept
    const concept = await prisma.learningConcept.findFirst();
    expect(concept).toBeDefined();

    if (concept) {
      // 3. Initialize UserLearningItem
      const item = await ConceptService.getOrCreateUserLearningItem(testUser.id, concept.id);
      expect(item.id).toBeDefined();
      expect(item.userId).toBe(testUser.id);
      expect(item.conceptId).toBe(concept.id);
      expect(item.masteryState).toBe("DISCOVERED");
      expect(item.recognitionMastery).toBe(0.0);
      expect(item.recallMastery).toBe(0.0);
      expect(item.productionMastery).toBe(0.0);

      // 4. Calling it again should return the existing item
      const itemSecondTime = await ConceptService.getOrCreateUserLearningItem(testUser.id, concept.id);
      expect(itemSecondTime.id).toBe(item.id);
    }

    // Clean up
    await prisma.user.delete({ where: { id: testUser.id } });
  });
});
