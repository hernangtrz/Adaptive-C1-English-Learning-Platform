import { prisma } from "@/db/prisma";
import {
  GrammarCategory,
  GrammarTransformationExercise,
  GrammarErrorIdentificationExercise,
  GrammarEvaluationResult,
} from "./types";
import {
  C1_GRAMMAR_TRANSFORMATIONS,
  C1_GRAMMAR_ERRORS,
} from "./grammar-seed";
import { ReviewService } from "@/modules/reviews/review.service";

export class GrammarService {
  /**
   * Retrieves high-level C1 grammar tracks and structure overviews.
   */
  static getGrammarTracks() {
    const categories: Array<{
      category: GrammarCategory;
      title: string;
      description: string;
      badge: string;
      transformationCount: number;
      errorCount: number;
    }> = [
      {
        category: "INVERSION",
        title: "Negative & Emphatic Inversion",
        description: "Inverted auxiliary structures ('Rarely have I...', 'Under no circumstances must you...') for formal discourse.",
        badge: "High C1 Priority",
        transformationCount: C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === "INVERSION").length,
        errorCount: C1_GRAMMAR_ERRORS.filter((e) => e.category === "INVERSION").length,
      },
      {
        category: "MIXED_CONDITIONALS",
        title: "Mixed & Inverted Conditionals",
        description: "Counterfactual hypothetical combinations bridging past actions with present continuous reality.",
        badge: "Advanced",
        transformationCount: C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === "MIXED_CONDITIONALS").length,
        errorCount: C1_GRAMMAR_ERRORS.filter((e) => e.category === "MIXED_CONDITIONALS").length,
      },
      {
        category: "CLEFT_SENTENCES",
        title: "Cleft Sentences & Focus Framing",
        description: "Wh-clefts ('What surprised us was...') and It-clefts ('It was only after...') to highlight salient arguments.",
        badge: "Discourse Framing",
        transformationCount: C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === "CLEFT_SENTENCES").length,
        errorCount: C1_GRAMMAR_ERRORS.filter((e) => e.category === "CLEFT_SENTENCES").length,
      },
      {
        category: "SUBJUNCTIVE_MODALS",
        title: "Mandative Subjunctive & Formal Modals",
        description: "Bare infinitive subjunctive clauses following verbs of demand, advice, and urgency.",
        badge: "Precision",
        transformationCount: C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === "SUBJUNCTIVE_MODALS").length,
        errorCount: C1_GRAMMAR_ERRORS.filter((e) => e.category === "SUBJUNCTIVE_MODALS").length,
      },
      {
        category: "PARTICIPLE_CLAUSES",
        title: "Participle Clauses & Conciseness",
        description: "Present and perfect participle clauses ('Having completed...') for economical, executive writing.",
        badge: "Executive Style",
        transformationCount: C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === "PARTICIPLE_CLAUSES").length,
        errorCount: C1_GRAMMAR_ERRORS.filter((e) => e.category === "PARTICIPLE_CLAUSES").length,
      },
    ];

    return categories;
  }

  /**
   * Retrieves sentence transformations by category or all.
   */
  static getTransformations(category?: GrammarCategory): GrammarTransformationExercise[] {
    if (!category) return C1_GRAMMAR_TRANSFORMATIONS;
    return C1_GRAMMAR_TRANSFORMATIONS.filter((t) => t.category === category);
  }

  /**
   * Retrieves error identification exercises by category or all.
   */
  static getErrorIdentifications(category?: GrammarCategory): GrammarErrorIdentificationExercise[] {
    if (!category) return C1_GRAMMAR_ERRORS;
    return C1_GRAMMAR_ERRORS.filter((e) => e.category === category);
  }

  /**
   * Evaluates a sentence transformation attempt.
   */
  static evaluateTransformation(
    exercise: GrammarTransformationExercise,
    userAnswer: string
  ): GrammarEvaluationResult {
    const raw = userAnswer.trim();
    const normalizedInput = raw.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
    const normalizedTarget = exercise.targetExpectedSentence.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");

    const acceptable = exercise.acceptableVariations.map((v) =>
      v.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ")
    );

    // 1. Exact match
    if (normalizedInput === normalizedTarget || acceptable.includes(normalizedInput)) {
      return {
        isCorrect: true,
        accuracyScore: 1.0,
        feedback: "Flawless sentence transformation! Correct syntax and word order.",
        correctAnswer: exercise.targetExpectedSentence,
      };
    }

    // 2. Target inverted phrase present, but minor variance in sentence tail
    const normalizedKey = exercise.keyPhrase.toLowerCase().replace(/[.,!?;:]/g, "").trim();
    if (normalizedInput.includes(normalizedKey)) {
      return {
        isCorrect: true,
        accuracyScore: 0.85,
        feedback: `Great job! You utilized the correct C1 grammar structure (${exercise.keyPhrase}). Target: "${exercise.targetExpectedSentence}".`,
        correctAnswer: exercise.targetExpectedSentence,
      };
    }

    // 3. Check if user wrote standard non-inverted order (e.g. "Rarely I have..." instead of "Rarely have I...")
    if (exercise.category === "INVERSION" && normalizedInput.startsWith(exercise.promptLead.toLowerCase())) {
      return {
        isCorrect: false,
        accuracyScore: 0.3,
        feedback: `Incorrect word order. After "${exercise.promptLead}", you must invert the auxiliary verb and subject: "${exercise.keyPhrase}".`,
        correctAnswer: exercise.targetExpectedSentence,
      };
    }

    return {
      isCorrect: false,
      accuracyScore: 0.0,
      feedback: `Incorrect transformation. Expected structure: "${exercise.targetExpectedSentence}".`,
      correctAnswer: exercise.targetExpectedSentence,
      diffExplanation: exercise.explanation,
    };
  }

  /**
   * Evaluates an error identification and correction attempt.
   */
  static evaluateErrorCorrection(
    exercise: GrammarErrorIdentificationExercise,
    userAnswer: string
  ): GrammarEvaluationResult {
    const raw = userAnswer.trim();
    const normalizedInput = raw.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
    const normalizedTarget = exercise.correctedSentence.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");

    const acceptable = exercise.acceptableCorrections.map((c) =>
      c.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ")
    );

    // Exact match of full corrected sentence or correction fragment
    if (normalizedInput === normalizedTarget || acceptable.includes(normalizedInput)) {
      return {
        isCorrect: true,
        accuracyScore: 1.0,
        feedback: "Spot on! You accurately identified and corrected the grammatical error.",
        correctAnswer: exercise.correctedSentence,
      };
    }

    // Partial correction or user wrote only the replacement word
    const errorFrag = exercise.errorFragment.toLowerCase().trim();
    if (!normalizedInput.includes(errorFrag) && normalizedInput.length > 2) {
      return {
        isCorrect: true,
        accuracyScore: 0.75,
        feedback: `Good catch! Target correction: "${exercise.correctedSentence}".`,
        correctAnswer: exercise.correctedSentence,
      };
    }

    return {
      isCorrect: false,
      accuracyScore: 0.0,
      feedback: `The error was in "${exercise.errorFragment}". Correct form: "${exercise.correctedSentence}".`,
      correctAnswer: exercise.correctedSentence,
      diffExplanation: exercise.explanation,
    };
  }

  /**
   * Records a grammar drill submission into the atomic Review Transaction and Mastery Engine.
   */
  static async submitGrammarReview(
    userId: string,
    exerciseId: string,
    userAnswer: string,
    accuracyScore: number,
    isCorrect: boolean,
    hintsUsed: number = 0
  ) {
    // Find or create representative grammar concept
    const exercise =
      C1_GRAMMAR_TRANSFORMATIONS.find((t) => t.id === exerciseId) ||
      C1_GRAMMAR_ERRORS.find((e) => e.id === exerciseId);

    const canonicalForm = exercise ? exercise.title : "C1 Grammar Pattern";

    let concept = await prisma.learningConcept.findFirst({
      where: { canonicalForm },
    });

    if (!concept) {
      concept = await prisma.learningConcept.create({
        data: {
          type: "GRAMMAR",
          canonicalForm,
          meaning: exercise?.explanation ?? "Advanced C1 grammatical structure and syntax",
          translationEs: exercise?.translationEs ?? "Estructura gramatical avanzada",
          cefrLevel: "C1",
          explanation: exercise?.explanation,
        },
      });
    }

    return ReviewService.processReviewSubmission({
      userId,
      conceptId: concept.id,
      exerciseType: "SENTENCE_BUILD",
      dimension: exercise?.dimension ?? "PRODUCTION",
      source: "GRAMMAR_EXERCISE",
      userAnswer,
      accuracyScore,
      isCorrect,
      hintsUsed,
      metadata: {
        exerciseId,
        category: exercise?.category,
      },
    });
  }
}
