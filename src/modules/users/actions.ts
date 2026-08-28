"use server";

import { UserService } from "./user.service";
import { registerSchema, updateProfileSchema } from "./validation";
import { requireAuth } from "@/modules/auth/session";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Server action to register a new user account.
 */
export async function registerUserAction(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResponse<{ userId: string }>> {
  try {
    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid input data.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const user = await UserService.registerUser(validated.data);
    return {
      success: true,
      message: "Account created successfully.",
      data: { userId: user.id },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    return {
      success: false,
      message,
    };
  }
}

/**
 * Server action to update user learning profile (CEFR level, daily target, timezone).
 */
export async function updateUserProfileAction(
  formData: {
    currentCEFRLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    targetCEFRLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
    dailyMinutes: number;
    timezone: string;
    nativeLanguage?: string;
    onboarded?: boolean;
  }
): Promise<ActionResponse> {
  try {
    const user = await requireAuth();

    const validated = updateProfileSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        message: "Invalid profile data.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const updatedProfile = await UserService.updateUserProfile(user.id, validated.data);

    return {
      success: true,
      message: "Learning profile updated successfully.",
      data: updatedProfile,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Profile update failed.";
    return {
      success: false,
      message,
    };
  }
}
