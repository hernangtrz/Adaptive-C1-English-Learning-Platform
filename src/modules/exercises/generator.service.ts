import { LearningConcept } from "@prisma/client";
import {
  MultipleChoiceExercise,
  ClozeExercise,
  CollocationMatchExercise,
  ControlledProductionExercise,
  VocabularyExerciseSuite,
  ExerciseEvaluationResult,
} from "./types";

export class ExerciseGeneratorService {
  /**
   * Generates a 4-step progressive exercise suite for a given Learning Concept:
   * 1. Recognition (Multiple Choice)
   * 2. Cloze (Contextual sentence recall)
   * 3. Collocation (Particle / Collocate pairing)
   * 4. Controlled Production (Scenario-based generation)
   */
  static generateConceptExerciseSuite(
    concept: LearningConcept,
    allConcepts: LearningConcept[] = []
  ): VocabularyExerciseSuite {
    const examples = Array.isArray(concept.examples)
      ? (concept.examples as Array<{ sentence: string; translationEs: string; context?: string }>)
      : [];

    const primaryExample =
      examples[0]?.sentence ??
      `In modern professional environments, it is essential to ${concept.canonicalForm} effectively.`;

    // 1. RECOGNITION (Multiple Choice)
    const otherMeanings = allConcepts
      .filter((c) => c.id !== concept.id && c.meaning !== concept.meaning)
      .map((c) => c.meaning)
      .slice(0, 10);

    const shuffledDistractors = otherMeanings.sort(() => Math.random() - 0.5).slice(0, 3);
    const recognitionOptions = [concept.meaning, ...shuffledDistractors].sort(
      () => Math.random() - 0.5
    );

    const recognition: MultipleChoiceExercise = {
      id: `rec_${concept.id}`,
      conceptId: concept.id,
      type: "RECOGNITION",
      dimension: "RECOGNITION",
      prompt: `What is the accurate meaning of "${concept.canonicalForm}"?`,
      instruction: "Select the definition that most accurately conveys the target expression.",
      options: recognitionOptions,
      correctAnswer: concept.meaning,
      hint: `Spanish Gloss: ${concept.translationEs}`,
      translationEs: concept.translationEs,
      contextSentence: primaryExample,
    };

    // 2. CLOZE (Contextual Recall)
    const regex = new RegExp(`\\b${escapeRegex(concept.canonicalForm)}\\b`, "gi");
    const clozeSentence = primaryExample.replace(regex, "__________");

    const cloze: ClozeExercise = {
      id: `cloze_${concept.id}`,
      conceptId: concept.id,
      type: "CLOZE",
      dimension: "RECALL",
      prompt: "Complete the sentence with the correct C1 target expression:",
      instruction: "Type the canonical form of the target expression that accurately fits the context.",
      clozeSentence: clozeSentence !== primaryExample ? clozeSentence : `We need to __________ (${concept.translationEs}).`,
      targetAnswer: concept.canonicalForm,
      acceptableAnswers: [
        concept.canonicalForm.toLowerCase().trim(),
        concept.canonicalForm.toLowerCase().replace(/[-_]/g, " ").trim(),
      ],
      hint: `Spanish Gloss: ${concept.translationEs}`,
      translationEs: concept.translationEs,
      contextSentence: primaryExample,
    };

    // 3. COLLOCATION / PAIRING (Structure Association)
    let collocationLead = "";
    let correctMatch = "";
    let collocationOptions: string[] = [];

    if (concept.type === "PHRASAL_VERB") {
      const parts = concept.canonicalForm.split(" ");
      const verb = parts[0];
      const particle = parts.slice(1).join(" ");
      collocationLead = `Complete the phrasal verb: "${verb}..."`;
      correctMatch = particle;
      const commonParticles = ["out", "up", "down", "on", "into", "through", "upon", "about"]
        .filter((p) => p !== particle)
        .slice(0, 3);
      collocationOptions = [correctMatch, ...commonParticles].sort(() => Math.random() - 0.5);
    } else if (concept.type === "COLLOCATION") {
      const words = concept.canonicalForm.split(" ");
      const lead = words.slice(0, Math.max(1, words.length - 2)).join(" ");
      const ending = words.slice(Math.max(1, words.length - 2)).join(" ");
      collocationLead = `Complete the collocation: "${lead}..."`;
      correctMatch = ending;
      collocationOptions = [
        correctMatch,
        "an important role",
        "a critical choice",
        "the final decision",
      ]
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 4)
        .sort(() => Math.random() - 0.5);
    } else {
      collocationLead = `Identify the natural companion usage for "${concept.canonicalForm}":`;
      correctMatch = concept.canonicalForm;
      collocationOptions = [
        concept.canonicalForm,
        "consequently",
        "predominantly",
        "simultaneously",
      ].sort(() => Math.random() - 0.5);
    }

    const collocation: CollocationMatchExercise = {
      id: `colloc_${concept.id}`,
      conceptId: concept.id,
      type: "RECALL",
      dimension: "RECALL",
      prompt: collocationLead,
      instruction: "Select the correct particle or collocate to complete the target phrase.",
      collocationLead,
      options: collocationOptions,
      correctMatch,
      hint: `Meaning: ${concept.meaning}`,
      translationEs: concept.translationEs,
      contextSentence: primaryExample,
    };

    // 4. CONTROLLED PRODUCTION (Active Generation)
    const production: ControlledProductionExercise = {
      id: `prod_${concept.id}`,
      conceptId: concept.id,
      type: "SENTENCE_BUILD",
      dimension: "PRODUCTION",
      prompt: `Produce a natural, spontaneous sentence using "${concept.canonicalForm}":`,
      instruction: "Write a complete sentence that clearly demonstrates your active mastery of this concept.",
      targetPhrase: concept.canonicalForm,
      scenario: `Demonstrate your active use of "${concept.canonicalForm}" in a professional, academic, or conversational context.`,
      sampleAcceptableSentence: primaryExample,
      requiredKeywords: concept.canonicalForm.toLowerCase().split(" "),
      hint: `Example Context: "${primaryExample}"`,
      translationEs: concept.translationEs,
      contextSentence: primaryExample,
    };

    return {
      conceptId: concept.id,
      canonicalForm: concept.canonicalForm,
      recognition,
      cloze,
      collocation,
      production,
    };
  }

  /**
   * Evaluates a user's answer for any exercise type deterministically.
   */
  static evaluateAnswer(
    exercise:
      | MultipleChoiceExercise
      | ClozeExercise
      | CollocationMatchExercise
      | ControlledProductionExercise,
    userAnswer: string
  ): ExerciseEvaluationResult {
    const raw = userAnswer.trim();
    const normalizedInput = raw.toLowerCase().replace(/\s+/g, " ");

    switch (exercise.type) {
      case "RECOGNITION": {
        const mc = exercise as MultipleChoiceExercise;
        const isCorrect = normalizedInput === mc.correctAnswer.toLowerCase().trim();
        return {
          isCorrect,
          accuracyScore: isCorrect ? 1.0 : 0.0,
          feedback: isCorrect
            ? "Correct! You accurately identified the definition."
            : `Incorrect. The correct definition is: "${mc.correctAnswer}".`,
          correctAnswer: mc.correctAnswer,
        };
      }

      case "CLOZE": {
        const cloze = exercise as ClozeExercise;
        const target = cloze.targetAnswer.toLowerCase().trim();
        const isExact = cloze.acceptableAnswers.some(
          (ans) => ans === normalizedInput
        );

        if (isExact) {
          return {
            isCorrect: true,
            accuracyScore: 1.0,
            feedback: "Perfect retrieval! Exact match.",
            correctAnswer: cloze.targetAnswer,
          };
        }

        // Check for minor typo (edit distance <= 1 on terms > 4 chars)
        if (target.length > 4 && computeLevenshtein(normalizedInput, target) <= 1) {
          return {
            isCorrect: true,
            accuracyScore: 0.85,
            feedback: `Almost exact (minor spelling variance). Target: "${cloze.targetAnswer}".`,
            correctAnswer: cloze.targetAnswer,
          };
        }

        // Partial match (e.g. root without particle or particle without root)
        if (normalizedInput.length > 3 && target.includes(normalizedInput)) {
          return {
            isCorrect: false,
            accuracyScore: 0.5,
            feedback: `Partial match. You wrote "${raw}", but the full target phrase is "${cloze.targetAnswer}".`,
            correctAnswer: cloze.targetAnswer,
          };
        }

        return {
          isCorrect: false,
          accuracyScore: 0.0,
          feedback: `Incorrect. The target expression was "${cloze.targetAnswer}".`,
          correctAnswer: cloze.targetAnswer,
        };
      }

      case "RECALL": {
        const colloc = exercise as CollocationMatchExercise;
        const isCorrect = normalizedInput === colloc.correctMatch.toLowerCase().trim();
        return {
          isCorrect,
          accuracyScore: isCorrect ? 1.0 : 0.0,
          feedback: isCorrect
            ? "Correct collocation match!"
            : `Incorrect. The natural pairing is "${colloc.correctMatch}".`,
          correctAnswer: colloc.correctMatch,
        };
      }

      case "SENTENCE_BUILD": {
        const prod = exercise as ControlledProductionExercise;
        const targetPhrase = prod.targetPhrase.toLowerCase();
        const words = normalizedInput.split(" ").filter(Boolean);

        const containsTarget = normalizedInput.includes(targetPhrase);
        const hasSubstantialLength = words.length >= 5;

        if (containsTarget && hasSubstantialLength) {
          return {
            isCorrect: true,
            accuracyScore: 1.0,
            feedback: "Excellent active production! You used the target phrase naturally in a full sentence.",
            correctAnswer: prod.sampleAcceptableSentence,
          };
        }

        if (containsTarget && !hasSubstantialLength) {
          return {
            isCorrect: true,
            accuracyScore: 0.7,
            feedback: "Good use of the target phrase, but try writing a longer, more complete sentence next time.",
            correctAnswer: prod.sampleAcceptableSentence,
          };
        }

        // Check if all individual required keywords are present
        const keywordsPresent = prod.requiredKeywords.every((kw) =>
          normalizedInput.includes(kw)
        );
        if (keywordsPresent && hasSubstantialLength) {
          return {
            isCorrect: true,
            accuracyScore: 0.8,
            feedback: "Well done! Target keywords utilized in your sentence.",
            correctAnswer: prod.sampleAcceptableSentence,
          };
        }

        return {
          isCorrect: false,
          accuracyScore: 0.2,
          feedback: `Your sentence did not include the full target expression "${prod.targetPhrase}". Sample: "${prod.sampleAcceptableSentence}".`,
          correctAnswer: prod.sampleAcceptableSentence,
        };
      }
    }
  }
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
