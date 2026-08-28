// Configurable Mastery & Priority Constants

export const MASTERY_WEIGHTS = {
  recognition: 0.2,
  recall: 0.3,
  production: 0.5,
} as const;

export const MASTERY_THRESHOLDS = {
  RECOGNIZED: {
    recognition: 0.75,
  },
  RECALLABLE: {
    recognition: 0.8,
    recall: 0.7,
  },
  ACTIVE: {
    recognition: 0.85,
    recall: 0.8,
    production: 0.7,
  },
  MASTERED: {
    recognition: 0.9,
    recall: 0.85,
    production: 0.8,
  },
} as const;

export const PRIORITY_WEIGHTS = {
  due: 0.3,
  weakness: 0.25,
  productionGap: 0.2,
  forgettingRisk: 0.15,
  recentError: 0.1,
} as const;
