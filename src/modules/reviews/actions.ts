"use server";

import { ReviewService } from "./review.service";
import { ReviewSubmissionInput } from "./types";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to get the active review queue for the signed-in user.
 */
export async function getReviewQueueAction(limit: number = 10) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to access reviews.",
        data: [],
      };
    }

    const queue = await ReviewService.getDueReviewQueue(user.id, limit);
    return {
      success: true,
      data: queue,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load review queue.";
    return {
      success: false,
      message,
      data: [],
    };
  }
}

/**
 * Server action to submit an exercise attempt and execute the atomic review transaction.
 */
export async function submitReviewAction(
  input: Omit<ReviewSubmissionInput, "userId">
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to submit reviews.",
      };
    }

    const result = await ReviewService.processReviewSubmission({
      ...input,
      userId: user.id,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit review.";
    return {
      success: false,
      message,
    };
  }
}

/**
 * Server action to fetch past review history.
 */
export async function getReviewHistoryAction(limit: number = 30) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to view review history.",
        data: [],
      };
    }

    const history = await ReviewService.getUserReviewHistory(user.id, limit);
    return {
      success: true,
      data: history,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load review history.";
    return {
      success: false,
      message,
      data: [],
    };
  }
}
