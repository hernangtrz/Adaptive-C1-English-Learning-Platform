import { EvidenceDimension } from "@prisma/client";

export type SpeakingPromptCategory =
  | "EXECUTIVE_DECISION"
  | "DEBATE_DISAGREEMENT"
  | "STRATEGIC_PITCH"
  | "PROBLEM_SOLVING_NARRATIVE";

export interface SpeakingPrompt {
  id: string;
  category: SpeakingPromptCategory;
  title: string;
  role: string;
  scenario: string;
  guidingQuestions: string[];
  mandatoryTargetConcepts: string[]; // e.g. ["mitigate", "bear in mind", "boil down to"]
  recommendedStructures: string[];   // e.g. ["Cleft sentence: 'What is paramount...'", "Inversion: 'Rarely have we...'"]
  timeLimitSeconds: number;
  modelC1Response: string;
  translationEs: string;
}

export interface FluencyMetrics {
  totalWords: number;
  durationSeconds: number;
  wordsPerMinute: number;
  paceAssessment: "Too Slow (<100 WPM)" | "Optimal C1 Pace (110-150 WPM)" | "Too Fast (>160 WPM)";
  fillerWordsCount: number;
  fillerWordsList: string[];
  fillerWordDensityPercent: number;
}

export interface LexicalUpgradeSuggestion {
  originalPhrase: string;
  c1Upgrade: string;
  reason: string;
}

export interface SpeakingEvaluationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  overallScorePercent: number;
  fluencyMetrics: FluencyMetrics;
  targetConceptsFound: string[];
  targetConceptsMissing: string[];
  lexicalUpgrades: LexicalUpgradeSuggestion[];
  grammarComplexityScore: number; // 0.0 to 1.0
  strengths: string[];
  areasForImprovement: string[];
  modelAnswer: string;
}
