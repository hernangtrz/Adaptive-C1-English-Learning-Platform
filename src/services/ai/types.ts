// AI Service Abstraction Layer

export interface SpeakingEvaluationInput {
  transcript: string;
  expectedConcepts?: string[];
  contextPrompt?: string;
}

export interface DetectedLanguageError {
  original: string;
  correction: string;
  type: "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "COLLOCATION" | "UNNATURAL_PHRASING";
  severity: "LOW" | "MEDIUM" | "HIGH";
  explanation: string;
}

export interface SpeakingEvaluationResult {
  score: number; // 0.0 - 1.0
  feedback: string;
  errors: DetectedLanguageError[];
  correctlyUsedConcepts: string[];
}

export interface WritingEvaluationInput {
  text: string;
  prompt: string;
  targetConcepts?: string[];
}

export interface WritingEvaluationResult {
  score: number; // 0.0 - 1.0
  feedback: string;
  errors: DetectedLanguageError[];
  suggestions: string[];
}

export interface AIService {
  evaluateSpeaking(input: SpeakingEvaluationInput): Promise<SpeakingEvaluationResult>;
  evaluateWriting(input: WritingEvaluationInput): Promise<WritingEvaluationResult>;
}
