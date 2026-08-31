"use server";

import { DailyTrainingService } from "./training.service";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to generate and fetch today's workout for the logged-in user.
 */
export async function getTodayWorkoutAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to access your daily workout.",
      };
    }

    const workout = await DailyTrainingService.generateDailyWorkout(user.id);
    return {
      success: true,
      data: workout,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load today's workout.";
    return {
      success: false,
      message,
    };
  }
}

/**
 * Server action to fetch user streak and habit data.
 */
export async function getUserStreakAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to access streak info.",
      };
    }

    const streak = await DailyTrainingService.getUserStreakInfo(user.id);
    return {
      success: true,
      data: streak,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load streak.";
    return {
      success: false,
      message,
    };
  }
}
