import { ReviewQueueItem } from "@/modules/reviews/types";
import { GrammarTransformationExercise } from "@/modules/grammar/types";
import { ListeningExercise } from "@/modules/listening/types";
import { LearningConcept } from "@prisma/client";

export type WorkoutBlockType =
  | "SPACED_REVIEW"
  | "PASSIVE_TO_ACTIVE"
  | "NEW_CONCEPT"
  | "GRAMMAR_PRECISION"
  | "LISTENING_CHALLENGE"
  | "ACTIVE_PRODUCTION"
  | "RECAP_SUMMARY";

export interface SpacedReviewBlock {
  type: "SPACED_REVIEW";
  title: string;
  description: string;
  items: ReviewQueueItem[];
  estimatedMinutes: number;
}

export interface PassiveToActiveBlock {
  type: "PASSIVE_TO_ACTIVE";
  title: string;
  description: string;
  concept: LearningConcept;
  productionGap: number;
  prompt: string;
  scenario: string;
  estimatedMinutes: number;
}

export interface NewConceptBlock {
  type: "NEW_CONCEPT";
  title: string;
  description: string;
  concept: LearningConcept;
  examples: Array<{ sentence: string; translationEs: string }>;
  estimatedMinutes: number;
}

export interface GrammarPrecisionBlock {
  type: "GRAMMAR_PRECISION";
  title: string;
  description: string;
  exercise: GrammarTransformationExercise;
  estimatedMinutes: number;
}

export interface ListeningChallengeBlock {
  type: "LISTENING_CHALLENGE";
  title: string;
  description: string;
  exercise: ListeningExercise;
  estimatedMinutes: number;
}

export interface ActiveProductionBlock {
  type: "ACTIVE_PRODUCTION";
  title: string;
  description: string;
  targetConcepts: Array<{ canonicalForm: string; translationEs: string }>;
  prompt: string;
  sampleAcceptable: string;
  estimatedMinutes: number;
}

export type WorkoutBlock =
  | SpacedReviewBlock
  | PassiveToActiveBlock
  | NewConceptBlock
  | GrammarPrecisionBlock
  | ListeningChallengeBlock
  | ActiveProductionBlock;

export interface DailyWorkoutPlan {
  id: string;
  userId: string;
  date: string;
  dailyMinutesBudget: number;
  totalEstimatedMinutes: number;
  blocks: WorkoutBlock[];
  streakDays: number;
  isCompletedToday: boolean;
}

export interface UserStreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPracticedDate: string | null;
  practicedToday: boolean;
  totalReviewsAllTime: number;
}
