export type WritingPromptCategory =
  | "EXECUTIVE_MEMO"
  | "PERSUASIVE_PROPOSAL"
  | "TECHNICAL_POST_MORTEM"
  | "ARGUMENTATIVE_ESSAY";

export interface WritingPrompt {
  id: string;
  category: WritingPromptCategory;
  title: string;
  genre: string;
  scenario: string;
  targetAudience: string;
  guidelines: string[];
  mandatoryTargetConcepts: string[]; // e.g. ["mitigate", "bear in mind", "paramount"]
  recommendedConnectors: string[];   // e.g. ["notwithstanding", "in light of", "furthermore"]
  minWords: number;
  maxWords: number;
  modelC1Response: string;
  translationEs: string;
}

export interface CohesionMetrics {
  totalWords: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  discourseMarkersFound: string[];
  discourseMarkerCount: number;
  cohesionRating: "Limited" | "Adequate" | "Sophisticated C1 Cohesion";
}

export interface RegisterUpgrade {
  informalPhrase: string;
  suggestedUpgrade: string;
  explanation: string;
}

export interface WritingEvaluationResult {
  isCorrect: boolean;
  accuracyScore: number; // 0.0 to 1.0
  overallScorePercent: number;
  cohesionMetrics: CohesionMetrics;
  targetConceptsFound: string[];
  targetConceptsMissing: string[];
  registerUpgrades: RegisterUpgrade[];
  structuralVarietyScore: number; // 0.0 to 1.0
  strengths: string[];
  areasForImprovement: string[];
  modelAnswer: string;
}
