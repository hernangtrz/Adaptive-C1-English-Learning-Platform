import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DailyTrainingService } from "./training.service";
import { prisma } from "@/db/prisma";

describe("DailyTrainingService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and profile
    const user = await prisma.user.create({
      data: {
        email: `training_engine_test_${Date.now()}@example.com`,
        name: "Daily Training Tester",
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

  it("should generate a complete structured daily workout for the user", async () => {
    const workout = await DailyTrainingService.generateDailyWorkout(testUserId);

    expect(workout.id).toContain(testUserId);
    expect(workout.blocks.length).toBeGreaterThanOrEqual(3);
    expect(workout.dailyMinutesBudget).toBe(30);

    const blockTypes = workout.blocks.map((b) => b.type);
    expect(blockTypes).toContain("GRAMMAR_PRECISION");
    expect(blockTypes).toContain("LISTENING_CHALLENGE");
    expect(blockTypes).toContain("ACTIVE_PRODUCTION");
  });

  it("should compute user streak information accurately", async () => {
    const streakInfo = await DailyTrainingService.getUserStreakInfo(testUserId);

    expect(streakInfo).toBeDefined();
    expect(streakInfo.currentStreak).toBeGreaterThanOrEqual(0);
    expect(streakInfo.longestStreak).toBeGreaterThanOrEqual(0);
  });
});
