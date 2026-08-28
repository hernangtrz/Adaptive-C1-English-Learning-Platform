import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, updateProfileSchema } from "./validation";

describe("User & Profile Validation Schemas", () => {
  describe("Registration Schema", () => {
    it("should accept valid registration input", () => {
      const input = {
        name: "Carlos Sanchez",
        email: "carlos@example.com",
        password: "StrongPassword2026",
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const input = {
        name: "Carlos Sanchez",
        email: "not-an-email",
        password: "StrongPassword2026",
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject short passwords", () => {
      const input = {
        name: "Carlos Sanchez",
        email: "carlos@example.com",
        password: "pass1",
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("should reject passwords without numbers", () => {
      const input = {
        name: "Carlos Sanchez",
        email: "carlos@example.com",
        password: "PasswordOnlyLetters",
      };

      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("Login Schema", () => {
    it("should accept valid login input", () => {
      const result = loginSchema.safeParse({
        email: "carlos@example.com",
        password: "Password123",
      });
      expect(result.success).toBe(true);
    });

    it("should normalize email to lowercase", () => {
      const result = loginSchema.safeParse({
        email: "CARLOS@EXAMPLE.COM",
        password: "Password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("carlos@example.com");
      }
    });
  });

  describe("Update Profile Schema", () => {
    it("should accept valid learning profile data", () => {
      const result = updateProfileSchema.safeParse({
        currentCEFRLevel: "B2",
        targetCEFRLevel: "C1",
        dailyMinutes: 45,
        timezone: "America/Bogota",
        nativeLanguage: "es",
        onboarded: true,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid CEFR level", () => {
      const result = updateProfileSchema.safeParse({
        currentCEFRLevel: "INVALID_LEVEL",
        targetCEFRLevel: "C1",
        dailyMinutes: 45,
        timezone: "UTC",
      });

      expect(result.success).toBe(false);
    });

    it("should reject daily minutes less than 10 or greater than 180", () => {
      const tooLow = updateProfileSchema.safeParse({
        currentCEFRLevel: "B2",
        targetCEFRLevel: "C1",
        dailyMinutes: 5,
        timezone: "UTC",
      });
      expect(tooLow.success).toBe(false);

      const tooHigh = updateProfileSchema.safeParse({
        currentCEFRLevel: "B2",
        targetCEFRLevel: "C1",
        dailyMinutes: 300,
        timezone: "UTC",
      });
      expect(tooHigh.success).toBe(false);
    });
  });
});
