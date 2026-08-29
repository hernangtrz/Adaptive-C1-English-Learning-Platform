import { EvidenceDimension } from "@prisma/client";

export type ListeningCategory =
  | "CONNECTED_SPEECH"
  | "FAST_DICTATION"
  | "BOARDROOM_COMPREHENSION"
  | "SHADOWING_LAB";

export interface ListeningComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ListeningExercise {
  id: string;
  category: ListeningCategory;
  title: string;
  scenario: string;
  spokenAudioText: string;
  connectedSpeechFeatures: string[]; // e.g. ["Elision of /t/", "Weak form of 'of' -> /əv/", "Linking /r/"]
  phoneticTranscription?: string;
  targetKeywords: string[];
  dimension: EvidenceDimension;
  translationEs: string;
  hint: string;
  comprehensionQuestions?: ListeningComprehensionQuestion[];
}

export interface ListeningEvaluationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  feedback: string;
  transcript: string;
  phoneticTranscription?: string;
  missedWords?: string[];
  connectedSpeechHighlights?: string[];
}
