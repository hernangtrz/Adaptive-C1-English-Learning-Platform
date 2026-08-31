"use server";

import { SpeakingService } from "./speaking.service";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to submit a speaking attempt, evaluate transcript, and record production evidence.
 */
export async function submitSpeakingAttemptAction(input: {
  promptId: string;
  transcript: string;
  durationSeconds: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to submit speaking simulations.",
      };
    }

    const result = await SpeakingService.submitSpeakingReview(
      user.id,
      input.promptId,
      input.transcript,
      input.durationSeconds
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record speaking review.";
    return {
      success: false,
      message,
    };
  }
}
