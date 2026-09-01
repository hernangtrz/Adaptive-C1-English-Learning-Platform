import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ProgressService } from "./progress.service";
import { prisma } from "@/db/prisma";

describe("ProgressService Unit & Integration Tests", () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `progress_test_${Date.now()}@example.com`,
        name: "Progress Tester",
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

  it("should generate a comprehensive progress audit report for the learner", async () => {
    const report = await ProgressService.getProgressReport(testUserId);

    expect(report).toBeDefined();
    expect(report?.userId).toBe(testUserId);
    expect(report?.overallC1ReadinessScore).toBeGreaterThanOrEqual(10);
    expect(report?.readinessBand).toBeDefined();

    // 4 Modalities
    expect(report?.modalities).toHaveLength(4);
    const modIds = report?.modalities.map((m) => m.id);
    expect(modIds).toContain("LEXICAL_MASTERY");
    expect(modIds).toContain("GRAMMAR_PRECISION");
    expect(modIds).toContain("LISTENING_DECODING");
    expect(modIds).toContain("PRODUCTIVE_OUTPUT");

    // Conversion Metrics
    expect(report?.conversion).toBeDefined();
    expect(report?.conversion.conversionRatePercent).toBeGreaterThanOrEqual(0);

    // Retention Metrics
    expect(report?.retention).toBeDefined();
    expect(report?.retention.buckets).toHaveLength(5);

    // Milestones
    expect(report?.milestones.length).toBeGreaterThanOrEqual(5);

    // Diagnostic Strengths & Recommendations
    expect(report?.strengths.length).toBeGreaterThanOrEqual(1);
    expect(report?.recommendedActions.length).toBeGreaterThanOrEqual(1);
  });
});
