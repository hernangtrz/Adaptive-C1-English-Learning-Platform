import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DashboardService } from "./dashboard.service";
import { prisma } from "@/db/prisma";

describe("DashboardService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `dashboard_test_${Date.now()}@example.com`,
        name: "Dashboard Tester",
      },
    });
    testUserId = user.id;

    await prisma.userProfile.create({
      data: {
        userId: testUserId,
        dailyMinutes: 30,
        currentCEFRLevel: "B2",
        targetCEFRLevel: "C1",
        onboarded: true,
      },
    });
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  it("should aggregate complete dashboard cockpit data for user", async () => {
    const data = await DashboardService.getDashboardData(testUserId);

    expect(data).toBeDefined();
    expect(data?.user.id).toBe(testUserId);
    expect(data?.c1ReadinessScore).toBeGreaterThanOrEqual(10);
    expect(data?.readinessBand).toBeDefined();
    expect(data?.weeklyActivity).toHaveLength(7);
    expect(data?.mastery).toBeDefined();
    expect(data?.streak).toBeDefined();
  });

  it("should calculate C1 Readiness Score accurately across proficiency levels", () => {
    // 1. New user with empty state
    const emptyScore = DashboardService.calculateC1ReadinessScore(
      {
        totalItems: 0,
        byState: { DISCOVERED: 0, LEARNING: 0, RECOGNIZED: 0, RECALLABLE: 0, ACTIVE: 0, MASTERED: 0 },
        averageRecognition: 0,
        averageRecall: 0,
        averageProduction: 0,
        averageOverallMastery: 0,
        averageProductionGap: 0,
        highProductionGapCount: 0,
        masteredCount: 0,
      },
      25
    );
    expect(emptyScore).toBe(10);

    // 2. Advanced C1 learner with high production and active concepts
    const advancedScore = DashboardService.calculateC1ReadinessScore(
      {
        totalItems: 20,
        byState: { DISCOVERED: 0, LEARNING: 2, RECOGNIZED: 3, RECALLABLE: 5, ACTIVE: 6, MASTERED: 4 },
        averageRecognition: 0.95,
        averageRecall: 0.9,
        averageProduction: 0.85,
        averageOverallMastery: 0.88,
        averageProductionGap: 0.05,
        highProductionGapCount: 0,
        masteredCount: 4,
      },
      25
    );
    expect(advancedScore).toBeGreaterThanOrEqual(70);
  });
});
