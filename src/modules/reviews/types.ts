import {
  UserLearningItem,
  LearningEvidence,
  Review,
  EvidenceDimension,
  EvidenceSource,
  MasteryState,
  LearningConcept,
} from "@prisma/client";
import { FSRSRatingString } from "@/modules/fsrs/types";

export type ExerciseType =
  | "RECOGNITION"
  | "RECALL"
  | "CLOZE"
  | "SENTENCE_BUILD"
  | "CONTEXTUAL_REVIEW";

export interface ReviewSubmissionInput {
  userId: string;
  conceptId: string;
  exerciseType: ExerciseType;
  dimension: EvidenceDimension;
  source?: EvidenceSource;
  userAnswer?: string;
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  hintsUsed?: number;
  requiredAssistance?: boolean;
  timeSpentMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ReviewSubmissionResult {
  success: boolean;
  rating: FSRSRatingString;
  evidence: LearningEvidence;
  review: Review;
  item: UserLearningItem;
  nextReviewDue: Date;
  scheduledDays: number;
  newMasteryState: MasteryState;
  newOverallMastery: number;
  newProductionGap: number;
  dimensionScore: number;
}

export interface ReviewQueueItem {
  item: UserLearningItem;
  concept: LearningConcept;
  suggestedExerciseType: ExerciseType;
  targetDimension: EvidenceDimension;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  contextSentence?: string;
  translationEs: string;
  clozeSentence?: string;
}
