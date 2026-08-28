// Core Shared Types for Adaptive C1 English Learning Platform

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type MasteryState =
  | "DISCOVERED"
  | "LEARNING"
  | "RECOGNIZED"
  | "RECALLABLE"
  | "ACTIVE"
  | "MASTERED";

export type ConceptType =
  | "VOCABULARY"
  | "PHRASAL_VERB"
  | "COLLOCATION"
  | "GRAMMAR"
  | "FUNCTIONAL_EXPRESSION"
  | "SENTENCE_PATTERN"
  | "PRONUNCIATION";

export type EvidenceDimension = "RECOGNITION" | "RECALL" | "PRODUCTION";

export type EvidenceSource =
  | "VOCABULARY_REVIEW"
  | "GRAMMAR_EXERCISE"
  | "LISTENING"
  | "READING"
  | "SHADOWING"
  | "SPEAKING"
  | "WRITING";

export type FSRSRating = "AGAIN" | "HARD" | "GOOD" | "EASY";
