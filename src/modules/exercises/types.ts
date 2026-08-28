import { EvidenceDimension } from "@prisma/client";
import { ExerciseType } from "@/modules/reviews/types";

export interface BaseExercise {
  id: string;
  conceptId: string;
  type: ExerciseType;
  dimension: EvidenceDimension;
  prompt: string;
  instruction: string;
  hint?: string;
  contextSentence?: string;
  translationEs: string;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: "RECOGNITION";
  dimension: "RECOGNITION";
  options: string[];
  correctAnswer: string;
}

export interface ClozeExercise extends BaseExercise {
  type: "CLOZE";
  dimension: "RECALL";
  clozeSentence: string;
  targetAnswer: string;
  acceptableAnswers: string[];
}

export interface CollocationMatchExercise extends BaseExercise {
  type: "RECALL";
  dimension: "RECALL";
  collocationLead: string;
  options: string[];
  correctMatch: string;
}

export interface ControlledProductionExercise extends BaseExercise {
  type: "SENTENCE_BUILD";
  dimension: "PRODUCTION";
  targetPhrase: string;
  scenario: string;
  sampleAcceptableSentence: string;
  requiredKeywords: string[];
}

export interface VocabularyExerciseSuite {
  conceptId: string;
  canonicalForm: string;
  recognition: MultipleChoiceExercise;
  cloze: ClozeExercise;
  collocation: CollocationMatchExercise;
  production: ControlledProductionExercise;
}

export interface ExerciseEvaluationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  feedback: string;
  correctAnswer: string;
}
