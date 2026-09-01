"use server";

import { WritingService } from "./writing.service";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to submit a writing studio composition, evaluate text, and record production evidence.
 */
export async function submitWritingAttemptAction(input: {
  promptId: string;
  text: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to submit writing studio compositions.",
      };
    }

    const result = await WritingService.submitWritingReview(
      user.id,
      input.promptId,
      input.text
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record writing review.";
    return {
      success: false,
      message,
    };
  }
}
