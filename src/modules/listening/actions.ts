"use server";

import { ListeningService } from "./listening.service";
import { getCurrentUser } from "@/modules/auth/session";
import { EvidenceDimension } from "@prisma/client";

/**
 * Server action to record a listening comprehension / dictation attempt and update mastery.
 */
export async function submitListeningReviewAction(input: {
  exerciseId: string;
  accuracyScore: number;
  isCorrect: boolean;
  dimension?: EvidenceDimension;
  source?: "LISTENING" | "SHADOWING";
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to record listening exercises.",
      };
    }

    const result = await ListeningService.submitListeningReview(
      user.id,
      input.exerciseId,
      input.accuracyScore,
      input.isCorrect,
      input.dimension ?? "RECALL",
      input.source ?? "LISTENING"
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record listening submission.";
    return {
      success: false,
      message,
    };
  }
}
