import { prisma } from "@/db/prisma";
import { hashPassword } from "@/modules/auth/password";
import { RegisterInput, UpdateProfileInput } from "./validation";
import { CEFRLevel } from "@prisma/client";

export class UserService {
  /**
   * Registers a new user and creates their default learning profile in an atomic transaction.
   */
  static async registerUser(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
      });

      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          currentCEFRLevel: CEFRLevel.B2,
          targetCEFRLevel: CEFRLevel.C1,
          dailyMinutes: 30,
          timezone: "UTC",
          nativeLanguage: "es",
          onboarded: false,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profile,
      };
    });
  }

  /**
   * Retrieves a user by their email address with profile included.
   */
  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });
  }

  /**
   * Retrieves a user by their ID with profile included.
   */
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  /**
   * Retrieves or initializes a user's learning profile.
   */
  static async getUserProfile(userId: string) {
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          currentCEFRLevel: CEFRLevel.B2,
          targetCEFRLevel: CEFRLevel.C1,
          dailyMinutes: 30,
          timezone: "UTC",
          nativeLanguage: "es",
          onboarded: false,
        },
      });
    }

    return profile;
  }

  /**
   * Updates a user's learning profile.
   */
  static async updateUserProfile(userId: string, data: UpdateProfileInput) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: {
        currentCEFRLevel: data.currentCEFRLevel as CEFRLevel,
        targetCEFRLevel: data.targetCEFRLevel as CEFRLevel,
        dailyMinutes: data.dailyMinutes,
        timezone: data.timezone,
        nativeLanguage: data.nativeLanguage,
        onboarded: data.onboarded ?? true,
      },
      create: {
        userId,
        currentCEFRLevel: data.currentCEFRLevel as CEFRLevel,
        targetCEFRLevel: data.targetCEFRLevel as CEFRLevel,
        dailyMinutes: data.dailyMinutes,
        timezone: data.timezone,
        nativeLanguage: data.nativeLanguage,
        onboarded: data.onboarded ?? true,
      },
    });
  }
}
