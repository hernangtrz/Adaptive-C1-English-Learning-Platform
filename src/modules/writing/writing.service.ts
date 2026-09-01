import { prisma } from "@/db/prisma";
import {
  WritingPromptCategory,
  WritingPrompt,
  WritingEvaluationResult,
  CohesionMetrics,
  RegisterUpgrade,
} from "./types";
import { C1_WRITING_PROMPTS } from "./writing-seed";
import { ReviewService } from "@/modules/reviews/review.service";

export class WritingService {
  /**
   * Retrieves writing prompts by category or all.
   */
  static getWritingPrompts(category?: WritingPromptCategory): WritingPrompt[] {
    if (!category) return C1_WRITING_PROMPTS;
    return C1_WRITING_PROMPTS.filter((p) => p.category === category);
  }

  /**
   * Evaluates a written composition against C1 target concepts, register purity,
   * discourse cohesion markers, and structural variety.
   */
  static evaluateWrittenSubmission(
    prompt: WritingPrompt,
    text: string
  ): WritingEvaluationResult {
    const raw = text.trim();
    const normalized = raw.toLowerCase().replace(/[—–]/g, " ").replace(/\s+/g, " ");
    const words = raw.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // 1. Sentence & Word Count Analysis
    const rawSentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(1, rawSentences.length);
    const averageWordsPerSentence = Math.round((totalWords / sentenceCount) * 10) / 10;

    // 2. Target C1 Concepts Check (with inflection support)
    const targetConceptsFound: string[] = [];
    const targetConceptsMissing: string[] = [];

    for (const target of prompt.mandatoryTargetConcepts) {
      const normalizedTarget = target.toLowerCase().trim();
      const rootWords = normalizedTarget.split(" ");
      const baseRoot = rootWords[0].replace(/(s|ed|ing)$/i, "");

      const exactMatch = normalized.includes(normalizedTarget);
      const rootMatch = rootWords.length > 1
        ? new RegExp(`\\b${baseRoot}(s|ed|ing)?\\s+${rootWords.slice(1).join("\\s+")}\\b`, "i").test(normalized)
        : new RegExp(`\\b${baseRoot}(s|ed|ing|es)?\\b`, "i").test(normalized);

      if (exactMatch || rootMatch) {
        targetConceptsFound.push(target);
      } else {
        targetConceptsMissing.push(target);
      }
    }

    // 3. Cohesion & Discourse Markers Analysis
    const discourseMarkerList = [
      "notwithstanding", "in light of", "furthermore", "consequently",
      "whereas", "subsequently", "conversely", "nevertheless", "on the contrary",
      "in addition", "specifically", "therefore", "in contrast", "ultimately",
      "owing to", "in particular",
    ];

    const foundDiscourseMarkers: string[] = [];
    for (const marker of discourseMarkerList) {
      if (normalized.includes(marker)) {
        foundDiscourseMarkers.push(marker);
      }
    }

    let cohesionRating: CohesionMetrics["cohesionRating"] = "Limited";
    if (foundDiscourseMarkers.length >= 3) {
      cohesionRating = "Sophisticated C1 Cohesion";
    } else if (foundDiscourseMarkers.length >= 1) {
      cohesionRating = "Adequate";
    }

    const cohesionMetrics: CohesionMetrics = {
      totalWords,
      sentenceCount,
      averageWordsPerSentence,
      discourseMarkersFound: foundDiscourseMarkers,
      discourseMarkerCount: foundDiscourseMarkers.length,
      cohesionRating,
    };

    // 4. Informal Register Detection & Upgrades
    const registerUpgrades: RegisterUpgrade[] = [];
    const informalPatterns = [
      {
        pattern: /\ba lot of\b/gi,
        informalPhrase: "a lot of",
        suggestedUpgrade: "a substantial volume of / considerable",
        explanation: "Elevates informal quantifier to formal academic/executive weight.",
      },
      {
        pattern: /\bget better\b/gi,
        informalPhrase: "get better",
        suggestedUpgrade: "improve markedly / optimize",
        explanation: "Replaces vague verb with precise developmental terminology.",
      },
      {
        pattern: /\bmake sure\b/gi,
        informalPhrase: "make sure",
        suggestedUpgrade: "ensure / guarantee",
        explanation: "Standard formal executive register.",
      },
      {
        pattern: /\bfix the problem\b/gi,
        informalPhrase: "fix the problem",
        suggestedUpgrade: "mitigate the vulnerability / remediate the bottleneck",
        explanation: "Technical precision in engineering reports.",
      },
      {
        pattern: /\breally good\b/gi,
        informalPhrase: "really good",
        suggestedUpgrade: "exemplary / highly effective",
        explanation: "Formal evaluative adjective.",
      },
      {
        pattern: /\bthings like\b/gi,
        informalPhrase: "things like",
        suggestedUpgrade: "such as / notably",
        explanation: "Replaces imprecise filler phrasing.",
      },
    ];

    for (const item of informalPatterns) {
      if (item.pattern.test(raw)) {
        registerUpgrades.push({
          informalPhrase: item.informalPhrase,
          suggestedUpgrade: item.suggestedUpgrade,
          explanation: item.explanation,
        });
      }
    }

    // 5. Structural Variety Scoring
    let complexityMarkers = 0;
    const structureChecks = [
      /\b(which|that|who|whose|where)\b/gi,
      /\b(having|following|given)\s+\w+/gi,
      /\bwhat\s+(we|is|are)\b/gi,
      /\b(it is|it was)\s+\w+\s+that\b/gi,
      /\b(tion|ment|ance|ence)\b/gi,
    ];

    for (const check of structureChecks) {
      if (check.test(raw)) {
        complexityMarkers++;
      }
    }

    const structuralVarietyScore = Math.min(1.0, 0.4 + complexityMarkers * 0.15);

    // 6. Overall Multi-Dimensional Scoring
    const conceptRatio =
      prompt.mandatoryTargetConcepts.length > 0
        ? targetConceptsFound.length / prompt.mandatoryTargetConcepts.length
        : 1.0;

    const lengthRatio =
      totalWords >= prompt.minWords && totalWords <= prompt.maxWords + 50
        ? 1.0
        : totalWords >= prompt.minWords * 0.7
        ? 0.75
        : 0.4;

    const cohesionScore =
      foundDiscourseMarkers.length >= 2 ? 1.0 : foundDiscourseMarkers.length === 1 ? 0.75 : 0.4;

    const registerPenalty = Math.min(0.25, registerUpgrades.length * 0.1);
    const registerScore = Math.max(0.0, 1.0 - registerPenalty);

    const weightedScore =
      conceptRatio * 0.35 +
      lengthRatio * 0.20 +
      cohesionScore * 0.25 +
      registerScore * 0.20;

    const accuracyScore = Math.round(Math.max(0.1, Math.min(1.0, weightedScore)) * 1000) / 1000;
    const overallScorePercent = Math.round(accuracyScore * 100);
    const isCorrect = accuracyScore >= 0.65 && targetConceptsMissing.length === 0;

    // 7. Qualitative Strengths and Recommendations
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    if (targetConceptsFound.length > 0) {
      strengths.push(`Accurately deployed target C1 expressions: ${targetConceptsFound.join(", ")}.`);
    }
    if (foundDiscourseMarkers.length >= 2) {
      strengths.push(`Sophisticated paragraph cohesion with formal transitions: ${foundDiscourseMarkers.join(", ")}.`);
    }
    if (registerUpgrades.length === 0) {
      strengths.push("Consistent executive register with no informal colloquialisms detected.");
    }

    if (targetConceptsMissing.length > 0) {
      areasForImprovement.push(`Incorporate mandatory C1 expressions: ${targetConceptsMissing.join(", ")}.`);
    }
    if (totalWords < prompt.minWords) {
      areasForImprovement.push(`Expand composition to at least ${prompt.minWords} words (currently ${totalWords} words).`);
    }
    if (foundDiscourseMarkers.length < 2) {
      areasForImprovement.push(`Introduce formal discourse connectors such as: ${prompt.recommendedConnectors.join(", ")}.`);
    }
    if (registerUpgrades.length > 0) {
      areasForImprovement.push(`Elevate ${registerUpgrades.length} informal phrase(s) to C1 executive prose.`);
    }

    return {
      isCorrect,
      accuracyScore,
      overallScorePercent,
      cohesionMetrics,
      targetConceptsFound,
      targetConceptsMissing,
      registerUpgrades,
      structuralVarietyScore,
      strengths,
      areasForImprovement,
      modelAnswer: prompt.modelC1Response,
    };
  }

  /**
   * Records a written studio submission into the atomic Review Transaction & Mastery Engine.
   */
  static async submitWritingReview(
    userId: string,
    promptId: string,
    text: string
  ) {
    const prompt = C1_WRITING_PROMPTS.find((p) => p.id === promptId);
    if (!prompt) {
      throw new Error(`Writing prompt with id ${promptId} not found.`);
    }

    const evaluation = this.evaluateWrittenSubmission(prompt, text);

    let concept = await prisma.learningConcept.findFirst({
      where: { canonicalForm: prompt.title },
    });

    if (!concept) {
      concept = await prisma.learningConcept.create({
        data: {
          type: "FUNCTIONAL_EXPRESSION",
          canonicalForm: prompt.title,
          meaning: prompt.scenario,
          translationEs: prompt.translationEs,
          cefrLevel: "C1",
          explanation: prompt.guidelines.join("; "),
        },
      });
    }

    const reviewResult = await ReviewService.processReviewSubmission({
      userId,
      conceptId: concept.id,
      exerciseType: "SENTENCE_BUILD",
      dimension: "PRODUCTION",
      source: "WRITING",
      userAnswer: text,
      accuracyScore: evaluation.accuracyScore,
      isCorrect: evaluation.isCorrect,
      timeSpentMs: 60000,
      metadata: {
        promptId,
        wordCount: evaluation.cohesionMetrics.totalWords,
        discourseMarkers: evaluation.cohesionMetrics.discourseMarkersFound,
        targetsFound: evaluation.targetConceptsFound,
      },
    });

    return {
      evaluation,
      submission: reviewResult,
    };
  }
}
