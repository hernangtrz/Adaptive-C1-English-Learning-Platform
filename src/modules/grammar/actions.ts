"use server";

import { GrammarService } from "./grammar.service";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to submit a grammar exercise attempt and update mastery.
 */
export async function submitGrammarExerciseAction(input: {
  exerciseId: string;
  userAnswer: string;
  accuracyScore: number;
  isCorrect: boolean;
  hintsUsed?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to submit grammar exercises.",
      };
    }

    const result = await GrammarService.submitGrammarReview(
      user.id,
      input.exerciseId,
      input.userAnswer,
      input.accuracyScore,
      input.isCorrect,
      input.hintsUsed ?? 0
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record grammar submission.";
    return {
      success: false,
      message,
    };
  }
}
