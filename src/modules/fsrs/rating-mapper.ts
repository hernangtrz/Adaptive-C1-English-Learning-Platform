import { Rating, Grade } from "ts-fsrs";
import { FSRSRatingString, RatingEvaluationOptions } from "./types";

/**
 * Maps a continuous accuracy/evidence score (0.0 to 1.0) to an FSRS rating.
 *
 * Base mapping thresholds:
 * - 0.00 - 0.49: AGAIN
 * - 0.50 - 0.69: HARD
 * - 0.70 - 0.89: GOOD
 * - 0.90 - 1.00: EASY
 *
 * Assistance / Hint penalty rule:
 * - If hints were used (>= 2) or requiredAssistance is true:
 *   EASY is downgraded to HARD, and GOOD is downgraded to HARD.
 * - If 1 hint was used:
 *   EASY is downgraded to GOOD.
 */
export function scoreToFSRSRating(
  score: number,
  options?: RatingEvaluationOptions
): FSRSRatingString {
  // Clamp score between 0.0 and 1.0
  const clampedScore = Math.max(0, Math.min(1, score));

  let rawRating: FSRSRatingString;
  if (clampedScore < 0.5) {
    rawRating = "AGAIN";
  } else if (clampedScore < 0.7) {
    rawRating = "HARD";
  } else if (clampedScore < 0.9) {
    rawRating = "GOOD";
  } else {
    rawRating = "EASY";
  }

  // Apply assistance / hint penalties if applicable
  const hintsUsed = options?.hintsUsed ?? 0;
  const requiredAssistance = options?.requiredAssistance ?? false;

  if (requiredAssistance || hintsUsed >= 2) {
    // Substantial assistance needed: never award EASY or GOOD
    if (rawRating === "EASY" || rawRating === "GOOD") {
      return "HARD";
    }
  } else if (hintsUsed === 1) {
    // Minor assistance needed: downgrade EASY to GOOD
    if (rawRating === "EASY") {
      return "GOOD";
    }
  }

  return rawRating;
}

/**
 * Converts a domain FSRSRating string to the ts-fsrs numeric Grade enum.
 */
export function toTsFsrsRating(rating: FSRSRatingString): Grade {
  switch (rating) {
    case "AGAIN":
      return Rating.Again;
    case "HARD":
      return Rating.Hard;
    case "GOOD":
      return Rating.Good;
    case "EASY":
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

/**
 * Converts a ts-fsrs numeric Rating/Grade enum to the domain FSRSRating string.
 */
export function fromTsFsrsRating(rating: Rating | Grade): FSRSRatingString {
  switch (rating) {
    case Rating.Again:
      return "AGAIN";
    case Rating.Hard:
      return "HARD";
    case Rating.Good:
      return "GOOD";
    case Rating.Easy:
      return "EASY";
    default:
      return "GOOD";
  }
}
