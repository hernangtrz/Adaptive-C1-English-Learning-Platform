import { describe, it, expect } from "vitest";
import { prisma } from "@/db/prisma";
import { UserService } from "@/modules/users/user.service";

describe("Live Supabase Integration Test", () => {
  it("should connect to Supabase PostgreSQL and query system health", async () => {
    const health = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT count(*)::bigint as count FROM users`;
    expect(health).toBeDefined();
    expect(Array.isArray(health)).toBe(true);
  });

  it("should be able to register a user and initialize their learning profile in Supabase", async () => {
    const testEmail = `test_learner_${Date.now()}@example.com`;
    const user = await UserService.registerUser({
      name: "Maria Rodriguez",
      email: testEmail,
      password: "C1MasteryPassword2026!",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.profile).toBeDefined();
    expect(user.profile?.currentCEFRLevel).toBe("B2");
    expect(user.profile?.targetCEFRLevel).toBe("C1");
    expect(user.profile?.dailyMinutes).toBe(30);

    // Clean up test user
    await prisma.user.delete({ where: { id: user.id } });
  });
});
