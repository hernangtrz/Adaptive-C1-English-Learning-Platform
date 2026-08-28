import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FSRSService } from "./fsrs.service";
import { prisma } from "@/db/prisma";
import { State } from "ts-fsrs";

describe("FSRSService Spaced Repetition Logic", () => {
  describe("Card Reconstruction & Conversions", () => {
    it("should create a valid empty card for a new item", () => {
      const now = new Date();
      const card = FSRSService.toFSRSCard(null, now);

      expect(card).toBeDefined();
      expect(card.state).toBe(State.New);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.stability).toBe(0);
    });

    it("should reconstruct an existing card from UserLearningItem fields", () => {
      const lastReview = new Date("2026-08-01T10:00:00Z");
      const dueDate = new Date("2026-08-05T10:00:00Z");

      const item = {
        fsrsState: 2, // State.Review
        fsrsStability: 4.5,
        fsrsDifficulty: 3.2,
        fsrsElapsedDays: 3,
        fsrsScheduledDays: 4,
        fsrsReps: 3,
        fsrsLapses: 0,
        fsrsLastReview: lastReview,
        fsrsDueDate: dueDate,
      };

      const card = FSRSService.toFSRSCard(item);

      expect(card.state).toBe(State.Review);
      expect(card.stability).toBe(4.5);
      expect(card.difficulty).toBe(3.2);
      expect(card.reps).toBe(3);
      expect(card.last_review).toEqual(lastReview);
      expect(card.due).toEqual(dueDate);
    });
  });

  describe("Scheduling Previews", () => {
    it("should preview all 4 rating choices for a new card", () => {
      const now = new Date();
      const previews = FSRSService.previewNextReviews(null, now);

      expect(previews.AGAIN).toBeDefined();
      expect(previews.HARD).toBeDefined();
      expect(previews.GOOD).toBeDefined();
      expect(previews.EASY).toBeDefined();

      // Stability and intervals should increase: AGAIN <= HARD <= GOOD <= EASY
      expect(previews.EASY.stability).toBeGreaterThan(previews.GOOD.stability);
      expect(previews.GOOD.stability).toBeGreaterThan(previews.HARD.stability);
      expect(previews.EASY.due.getTime()).toBeGreaterThan(previews.GOOD.due.getTime());
    });
  });

  describe("FSRS State Progression & Lapses", () => {
    it("should advance a new card into Learning/Review state upon GOOD rating", () => {
      const now = new Date();
      const nextSchedule = FSRSService.calculateNextState(null, "GOOD", now);

      expect(nextSchedule.card.reps).toBe(1);
      expect(nextSchedule.card.lapses).toBe(0);
      expect(nextSchedule.card.stability).toBeGreaterThan(0);
      expect(nextSchedule.card.due.getTime()).toBeGreaterThan(now.getTime());
    });

    it("should record a lapse when a reviewed card receives an AGAIN rating", () => {
      const reviewedCard = {
        fsrsState: 2, // Review state
        fsrsStability: 5.0,
        fsrsDifficulty: 4.0,
        fsrsElapsedDays: 5,
        fsrsScheduledDays: 5,
        fsrsReps: 4,
        fsrsLapses: 0,
        fsrsLastReview: new Date("2026-08-20T00:00:00Z"),
        fsrsDueDate: new Date("2026-08-25T00:00:00Z"),
      };

      const now = new Date("2026-08-25T00:00:00Z");
      const nextSchedule = FSRSService.calculateNextState(reviewedCard, "AGAIN", now);

      expect(nextSchedule.card.lapses).toBe(1);
      expect(nextSchedule.card.reps).toBe(5);
      expect(nextSchedule.card.state).toBe(State.Relearning);
    });
  });

  describe("Database Review Transactions & Persistence", () => {
    let testUserId: string;
    let testConceptId: string;

    beforeAll(async () => {
      // 1. Create a test user
      const user = await prisma.user.create({
        data: {
          email: `fsrs_test_${Date.now()}@example.com`,
          name: "FSRS Tester",
        },
      });
      testUserId = user.id;

      // 2. Fetch or create a test concept
      let concept = await prisma.learningConcept.findFirst();
      if (!concept) {
        concept = await prisma.learningConcept.create({
          data: {
            type: "VOCABULARY",
            canonicalForm: "fsrs_test_term",
            meaning: "A test term for FSRS",
            translationEs: "término de prueba",
          },
        });
      }
      testConceptId = concept.id;
    });

    afterAll(async () => {
      // Clean up test user (cascades to userLearningItems and reviews)
      if (testUserId) {
        await prisma.user.delete({ where: { id: testUserId } });
      }
    });

    it("should process and persist a review transaction atomically in Supabase", async () => {
      const result = await FSRSService.processReview(
        testUserId,
        testConceptId,
        "GOOD",
        {
          reviewType: "RECALL",
          evidenceScore: 0.85,
          timeSpentMs: 4500,
        }
      );

      expect(result.item).toBeDefined();
      expect(result.item.userId).toBe(testUserId);
      expect(result.item.conceptId).toBe(testConceptId);
      expect(result.item.totalReviews).toBe(1);
      expect(result.item.successfulReviews).toBe(1);
      expect(result.item.fsrsStability).toBeGreaterThan(0);
      expect(result.item.fsrsDueDate).toBeDefined();

      expect(result.review).toBeDefined();
      expect(result.review.rating).toBe("GOOD");
      expect(result.review.reviewType).toBe("RECALL");
      expect(result.review.evidenceScore).toBe(0.85);
      expect(result.review.timeSpentMs).toBe(4500);
    });

    it("should retrieve due items for a user", async () => {
      const dueItems = await FSRSService.getDueItems(
        testUserId,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Future date to guarantee inclusion
      );

      expect(dueItems.length).toBeGreaterThanOrEqual(1);
      expect(dueItems[0].concept).toBeDefined();
    });
  });
});
