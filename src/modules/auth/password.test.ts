import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Password Utility", () => {
  it("should hash a valid password and produce a bcrypt hash", async () => {
    const password = "SecurePassword123!";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("should verify a matching password successfully", async () => {
    const password = "TargetC1Fluency2026!";
    const hash = await hashPassword(password);

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "TargetC1Fluency2026!";
    const hash = await hashPassword(password);

    const isMatch = await verifyPassword("WrongPassword123", hash);
    expect(isMatch).toBe(false);
  });

  it("should reject passwords shorter than 8 characters", async () => {
    await expect(hashPassword("short1")).rejects.toThrow(
      "Password must be at least 8 characters long."
    );
  });

  it("should return false when verifying with empty input", async () => {
    const isMatch = await verifyPassword("", "");
    expect(isMatch).toBe(false);
  });
});
