import { EvidenceDimension } from "@prisma/client";

export type GrammarCategory =
  | "INVERSION"
  | "MIXED_CONDITIONALS"
  | "CLEFT_SENTENCES"
  | "SUBJUNCTIVE_MODALS"
  | "PARTICIPLE_CLAUSES";

export interface GrammarTransformationExercise {
  id: string;
  conceptId?: string;
  category: GrammarCategory;
  title: string;
  baseSentence: string;
  promptLead: string;
  targetExpectedSentence: string;
  acceptableVariations: string[];
  keyPhrase: string;
  dimension: EvidenceDimension;
  explanation: string;
  translationEs: string;
  hint: string;
}

export interface GrammarErrorIdentificationExercise {
  id: string;
  conceptId?: string;
  category: GrammarCategory;
  title: string;
  erroneousSentence: string;
  errorFragment: string;
  correctedSentence: string;
  acceptableCorrections: string[];
  dimension: EvidenceDimension;
  explanation: string;
  translationEs: string;
  hint: string;
}

export interface GrammarExerciseSuite {
  category: GrammarCategory;
  title: string;
  transformations: GrammarTransformationExercise[];
  errorIdentifications: GrammarErrorIdentificationExercise[];
}

export interface GrammarEvaluationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  feedback: string;
  correctAnswer: string;
  diffExplanation?: string;
}
