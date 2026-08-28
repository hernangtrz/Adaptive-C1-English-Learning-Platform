import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReviewService } from "./review.service";
import { prisma } from "@/db/prisma";

describe("ReviewService Integration Tests (11-Step Review Transaction)", () => {
  let testUserId: string;
  let testConceptId: string;

  beforeAll(async () => {
    // 1. Create a test user
    const user = await prisma.user.create({
      data: {
        email: `review_engine_test_${Date.now()}@example.com`,
        name: "Review Engine Tester",
      },
    });
    testUserId = user.id;

    // 2. Fetch or create a test concept
    let concept = await prisma.learningConcept.findFirst({
      where: { canonicalForm: "carry out" },
    });
    if (!concept) {
      concept = await prisma.learningConcept.create({
        data: {
          type: "PHRASAL_VERB",
          canonicalForm: "carry out",
          meaning: "to perform or execute a task",
          translationEs: "llevar a cabo",
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

  it("should process a first review submission atomically in Supabase", async () => {
    const result = await ReviewService.processReviewSubmission({
      userId: testUserId,
      conceptId: testConceptId,
      exerciseType: "RECOGNITION",
      dimension: "RECOGNITION",
      accuracyScore: 1.0,
      isCorrect: true,
      hintsUsed: 0,
      timeSpentMs: 3200,
      userAnswer: "to perform or execute a task",
    });

    expect(result.success).toBe(true);
    expect(result.rating).toBe("EASY");
    expect(result.newOverallMastery).toBeGreaterThan(0.0);
    expect(result.item.recognitionMastery).toBeGreaterThan(0.5);
    expect(result.nextReviewDue).toBeDefined();

    // Verify Evidence audit record created
    expect(result.evidence).toBeDefined();
    expect(result.evidence.score).toBe(1.0);
    expect(result.evidence.dimension).toBe("RECOGNITION");

    // Verify Review attempt record created
    expect(result.review).toBeDefined();
    expect(result.review.rating).toBe("EASY");
    expect(result.review.timeSpentMs).toBe(3200);
  });

  it("should penalize FSRS rating to HARD when hints are used even with 1.0 score", async () => {
    const result = await ReviewService.processReviewSubmission({
      userId: testUserId,
      conceptId: testConceptId,
      exerciseType: "CLOZE",
      dimension: "RECALL",
      accuracyScore: 1.0,
      isCorrect: true,
      hintsUsed: 2, // 2 hints penalty rule
      timeSpentMs: 6500,
      userAnswer: "carry out",
    });

    expect(result.success).toBe(true);
    expect(result.rating).toBe("HARD");
    expect(result.item.recallMastery).toBeGreaterThan(0.4);
    expect(result.review.rating).toBe("HARD");
  });

  it("should populate an active review queue for the user", async () => {
    const queue = await ReviewService.getDueReviewQueue(testUserId, 5);

    expect(queue.length).toBeGreaterThanOrEqual(1);
    expect(queue[0].concept).toBeDefined();
    expect(queue[0].suggestedExerciseType).toBeDefined();
    expect(queue[0].prompt.length).toBeGreaterThan(0);
  });

  it("should retrieve immutable review history logs", async () => {
    const history = await ReviewService.getUserReviewHistory(testUserId, 10);

    expect(history.length).toBe(2); // 2 reviews submitted above
    expect(history[0].userLearningItem.concept.canonicalForm).toBe("carry out");
    expect(history[0].evidenceScore).toBe(1.0);
  });
});
