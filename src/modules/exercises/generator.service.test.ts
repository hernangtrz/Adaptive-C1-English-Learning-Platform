import { describe, it, expect } from "vitest";
import { ExerciseGeneratorService } from "./generator.service";
import { LearningConcept, ConceptType, CEFRLevel } from "@prisma/client";

describe("ExerciseGeneratorService Progressive Drill Suite", () => {
  const dummyConcept: LearningConcept = {
    id: "concept_test_123",
    type: "PHRASAL_VERB" as ConceptType,
    canonicalForm: "figure out",
    meaning: "to understand or solve a problem",
    translationEs: "averiguar / resolver",
    cefrLevel: "B2" as CEFRLevel,
    explanation: "Widely used in conversational English.",
    phonetics: "/ˈfɪɡ.jɚ aʊt/",
    tags: ["problem-solving"],
    examples: [
      {
        sentence: "We must figure out the root cause of this anomaly.",
        translationEs: "Debemos averiguar la causa raíz de esta anomalía.",
        context: "Engineering debugging",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const distractorConcepts: LearningConcept[] = [
    {
      id: "concept_dist_1",
      type: "VOCABULARY" as ConceptType,
      canonicalForm: "mitigate",
      meaning: "to reduce severity or risk",
      translationEs: "mitigar",
      cefrLevel: "C1" as CEFRLevel,
      explanation: null,
      phonetics: null,
      tags: [],
      examples: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "concept_dist_2",
      type: "COLLOCATION" as ConceptType,
      canonicalForm: "bridge the gap",
      meaning: "to reduce differences between groups",
      translationEs: "acortar la brecha",
      cefrLevel: "C1" as CEFRLevel,
      explanation: null,
      phonetics: null,
      tags: [],
      examples: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe("Suite Generation", () => {
    it("should generate all 4 progressive exercise modes for a concept", () => {
      const suite = ExerciseGeneratorService.generateConceptExerciseSuite(
        dummyConcept,
        distractorConcepts
      );

      expect(suite.conceptId).toBe(dummyConcept.id);
      expect(suite.canonicalForm).toBe("figure out");

      // 1. Recognition
      expect(suite.recognition).toBeDefined();
      expect(suite.recognition.type).toBe("RECOGNITION");
      expect(suite.recognition.dimension).toBe("RECOGNITION");
      expect(suite.recognition.correctAnswer).toBe(dummyConcept.meaning);
      expect(suite.recognition.options).toContain(dummyConcept.meaning);

      // 2. Cloze
      expect(suite.cloze).toBeDefined();
      expect(suite.cloze.type).toBe("CLOZE");
      expect(suite.cloze.dimension).toBe("RECALL");
      expect(suite.cloze.clozeSentence).toContain("__________");
      expect(suite.cloze.targetAnswer).toBe("figure out");

      // 3. Collocation
      expect(suite.collocation).toBeDefined();
      expect(suite.collocation.type).toBe("RECALL");
      expect(suite.collocation.dimension).toBe("RECALL");
      expect(suite.collocation.correctMatch).toBe("out");
      expect(suite.collocation.options).toContain("out");

      // 4. Production
      expect(suite.production).toBeDefined();
      expect(suite.production.type).toBe("SENTENCE_BUILD");
      expect(suite.production.dimension).toBe("PRODUCTION");
      expect(suite.production.targetPhrase).toBe("figure out");
    });
  });

  describe("Answer Evaluations", () => {
    const suite = ExerciseGeneratorService.generateConceptExerciseSuite(
      dummyConcept,
      distractorConcepts
    );

    it("should evaluate multiple choice recognition correctly", () => {
      const correctEval = ExerciseGeneratorService.evaluateAnswer(
        suite.recognition,
        dummyConcept.meaning
      );
      expect(correctEval.isCorrect).toBe(true);
      expect(correctEval.accuracyScore).toBe(1.0);

      const wrongEval = ExerciseGeneratorService.evaluateAnswer(
        suite.recognition,
        "an unrelated wrong definition"
      );
      expect(wrongEval.isCorrect).toBe(false);
      expect(wrongEval.accuracyScore).toBe(0.0);
    });

    it("should evaluate cloze recall with exact and typo tolerance", () => {
      // Exact match
      const exact = ExerciseGeneratorService.evaluateAnswer(suite.cloze, "figure out");
      expect(exact.isCorrect).toBe(true);
      expect(exact.accuracyScore).toBe(1.0);

      // Minor typo (e.g. "figur out" missing e)
      const typo = ExerciseGeneratorService.evaluateAnswer(suite.cloze, "figur out");
      expect(typo.isCorrect).toBe(true);
      expect(typo.accuracyScore).toBe(0.85);

      // Partial match ("figure")
      const partial = ExerciseGeneratorService.evaluateAnswer(suite.cloze, "figure");
      expect(partial.isCorrect).toBe(false);
      expect(partial.accuracyScore).toBe(0.5);

      // Incorrect
      const wrong = ExerciseGeneratorService.evaluateAnswer(suite.cloze, "carry on");
      expect(wrong.isCorrect).toBe(false);
      expect(wrong.accuracyScore).toBe(0.0);
    });

    it("should evaluate collocation match correctly", () => {
      const correct = ExerciseGeneratorService.evaluateAnswer(suite.collocation, "out");
      expect(correct.isCorrect).toBe(true);
      expect(correct.accuracyScore).toBe(1.0);

      const wrong = ExerciseGeneratorService.evaluateAnswer(suite.collocation, "into");
      expect(wrong.isCorrect).toBe(false);
      expect(wrong.accuracyScore).toBe(0.0);
    });

    it("should evaluate controlled production sentences", () => {
      // Full authentic sentence with target phrase
      const fullSentence = ExerciseGeneratorService.evaluateAnswer(
        suite.production,
        "It took our team two days to figure out the solution."
      );
      expect(fullSentence.isCorrect).toBe(true);
      expect(fullSentence.accuracyScore).toBe(1.0);

      // Short phrase containing target
      const shortPhrase = ExerciseGeneratorService.evaluateAnswer(
        suite.production,
        "I will figure out."
      );
      expect(shortPhrase.isCorrect).toBe(true);
      expect(shortPhrase.accuracyScore).toBe(0.7);

      // Missing target phrase
      const missing = ExerciseGeneratorService.evaluateAnswer(
        suite.production,
        "We worked hard on the problem yesterday."
      );
      expect(missing.isCorrect).toBe(false);
      expect(missing.accuracyScore).toBeLessThan(0.3);
    });
  });
});
