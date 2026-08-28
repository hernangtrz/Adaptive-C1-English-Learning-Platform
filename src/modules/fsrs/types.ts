import { Rating, State } from "ts-fsrs";

export type FSRSRatingString = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface RatingEvaluationOptions {
  hintsUsed?: number;
  requiredAssistance?: boolean;
  timeSpentMs?: number;
}

export interface FSRSSchedulePreview {
  rating: FSRSRatingString;
  numericRating: Rating;
  due: Date;
  scheduledDays: number;
  stability: number;
  difficulty: number;
  state: State;
  stateName: string;
}

export interface ProcessReviewOptions {
  reviewType?: string; // e.g. "RECOGNITION", "RECALL", "PRODUCTION", "CLOZE"
  timeSpentMs?: number;
  evidenceScore?: number;
  hintsUsed?: number;
  requiredAssistance?: boolean;
  reviewedAt?: Date;
}
