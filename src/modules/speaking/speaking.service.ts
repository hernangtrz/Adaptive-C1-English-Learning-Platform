import { prisma } from "@/db/prisma";
import {
  SpeakingPromptCategory,
  SpeakingPrompt,
  SpeakingEvaluationResult,
  FluencyMetrics,
  LexicalUpgradeSuggestion,
} from "./types";
import { C1_SPEAKING_PROMPTS } from "./speaking-seed";
import { ReviewService } from "@/modules/reviews/review.service";

export class SpeakingService {
  /**
   * Retrieves speaking prompts by category or all.
   */
  static getSpeakingPrompts(category?: SpeakingPromptCategory): SpeakingPrompt[] {
    if (!category) return C1_SPEAKING_PROMPTS;
    return C1_SPEAKING_PROMPTS.filter((p) => p.category === category);
  }

  /**
   * Evaluates a spoken transcript against target C1 concepts, fluency metrics,
   * filler word density, and lexical complexity.
   */
  static evaluateSpokenUtterance(
    prompt: SpeakingPrompt,
    transcript: string,
    durationSeconds: number = 45
  ): SpeakingEvaluationResult {
    const raw = transcript.trim();
    const normalized = raw.toLowerCase().replace(/[.,!?;:"'—–-]/g, " ").replace(/\s+/g, " ");
    const words = normalized.split(" ").filter(Boolean);
    const totalWords = words.length;

    // 1. Fluency & WPM Calculation
    const effectiveDuration = Math.max(10, durationSeconds);
    const wordsPerMinute = Math.round((totalWords / effectiveDuration) * 60);

    let paceAssessment: FluencyMetrics["paceAssessment"] = "Optimal C1 Pace (110-150 WPM)";
    if (wordsPerMinute < 100) {
      paceAssessment = "Too Slow (<100 WPM)";
    } else if (wordsPerMinute > 160) {
      paceAssessment = "Too Fast (>160 WPM)";
    }

    // 2. Filler Word Detection
    const fillerPatterns = ["um", "uh", "like", "you know", "sort of", "kind of", "basically", "actually"];
    const foundFillers: string[] = [];
    let fillerCount = 0;

    for (const filler of fillerPatterns) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = normalized.match(regex);
      if (matches) {
        fillerCount += matches.length;
        foundFillers.push(filler);
      }
    }

    const fillerDensity = totalWords > 0 ? Math.round((fillerCount / totalWords) * 1000) / 10 : 0;

    const fluencyMetrics: FluencyMetrics = {
      totalWords,
      durationSeconds: effectiveDuration,
      wordsPerMinute,
      paceAssessment,
      fillerWordsCount: fillerCount,
      fillerWordsList: Array.from(new Set(foundFillers)),
      fillerWordDensityPercent: fillerDensity,
    };

    // 3. Target C1 Concepts Check (with inflection support)
    const targetConceptsFound: string[] = [];
    const targetConceptsMissing: string[] = [];

    for (const target of prompt.mandatoryTargetConcepts) {
      const normalizedTarget = target.toLowerCase().trim();
      const rootWords = normalizedTarget.split(" ");
      const baseRoot = rootWords[0].replace(/(s|ed|ing)$/i, "");

      // Check exact match or inflection match
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

    // 4. Lexical Upgrades Analysis
    const lexicalUpgrades: LexicalUpgradeSuggestion[] = [];
    const upgradeDatabase = [
      {
        pattern: /\bvery important\b/gi,
        originalPhrase: "very important",
        c1Upgrade: "of paramount importance / imperative",
        reason: "Elevates register from basic emphasis to formal executive weight.",
      },
      {
        pattern: /\bsolve (the|this|that|a) problem\b/gi,
        originalPhrase: "solve the problem",
        c1Upgrade: "mitigate the risk / resolve the bottleneck",
        reason: "Demonstrates precision in engineering and operational contexts.",
      },
      {
        pattern: /\bgood idea\b/gi,
        originalPhrase: "good idea",
        c1Upgrade: "feasible proposition / viable approach",
        reason: "Reflects professional analytical evaluation.",
      },
      {
        pattern: /\btalk about\b/gi,
        originalPhrase: "talk about",
        c1Upgrade: "touch upon / shed light on",
        reason: "Replaces generic phrasing with high-impact C1 collocations.",
      },
      {
        pattern: /\bmake an agreement\b/gi,
        originalPhrase: "make an agreement",
        c1Upgrade: "reach a consensus",
        reason: "Idiomatic formal collocation for collaborative alignment.",
      },
    ];

    for (const item of upgradeDatabase) {
      if (item.pattern.test(raw)) {
        lexicalUpgrades.push({
          originalPhrase: item.originalPhrase,
          c1Upgrade: item.c1Upgrade,
          reason: item.reason,
        });
      }
    }

    // 5. Grammar Complexity Scoring
    let complexityTokens = 0;
    const complexMarkers = [
      "while", "although", "nevertheless", "whereas", "in terms of",
      "what we must", "it was only", "rarely", "under no circumstances",
      "had it not been", "if we had", "having completed",
    ];

    for (const marker of complexMarkers) {
      if (normalized.includes(marker)) {
        complexityTokens++;
      }
    }

    const grammarComplexityScore = Math.min(1.0, 0.4 + complexityTokens * 0.2);

    // 6. Overall Multi-Dimensional Score
    const conceptRatio =
      prompt.mandatoryTargetConcepts.length > 0
        ? targetConceptsFound.length / prompt.mandatoryTargetConcepts.length
        : 1.0;

    const fluencyScore =
      wordsPerMinute >= 90 && wordsPerMinute <= 170 ? 1.0 : wordsPerMinute >= 60 ? 0.8 : 0.6;

    const fillerPenalty = Math.min(0.3, (fillerCount / Math.max(1, totalWords)) * 1.5);
    const fillerScore = Math.max(0.0, 1.0 - fillerPenalty);

    const weightedScore =
      conceptRatio * 0.45 +
      fluencyScore * 0.25 +
      grammarComplexityScore * 0.20 +
      fillerScore * 0.10;

    const accuracyScore = Math.round(Math.max(0.1, Math.min(1.0, weightedScore)) * 1000) / 1000;
    const overallScorePercent = Math.round(accuracyScore * 100);
    const isCorrect = accuracyScore >= 0.60;

    // 7. Qualitative Strengths and Areas for Improvement
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    if (targetConceptsFound.length > 0) {
      strengths.push(`Successfully integrated target C1 expressions: ${targetConceptsFound.join(", ")}.`);
    }
    if (wordsPerMinute >= 110 && wordsPerMinute <= 150) {
      strengths.push(`Steady spoken delivery at ${wordsPerMinute} WPM within optimal C1 conversational pacing.`);
    }
    if (grammarComplexityScore >= 0.8) {
      strengths.push("Sophisticated sentence structuring with subordinate and discourse clauses.");
    }

    if (targetConceptsMissing.length > 0) {
      areasForImprovement.push(`Incorporate missing target expressions: ${targetConceptsMissing.join(", ")}.`);
    }
    if (fillerCount >= 3) {
      areasForImprovement.push(`Reduce filler word density (${fillerCount} filler occurrences detected: ${foundFillers.join(", ")}).`);
    }
    if (totalWords < 20) {
      areasForImprovement.push("Expand your spoken narrative with fuller argumentation and supporting details.");
    }

    return {
      isCorrect,
      accuracyScore,
      overallScorePercent,
      fluencyMetrics,
      targetConceptsFound,
      targetConceptsMissing,
      lexicalUpgrades,
      grammarComplexityScore,
      strengths,
      areasForImprovement,
      modelAnswer: prompt.modelC1Response,
    };
  }

  /**
   * Records a speaking simulation review into the atomic Review Transaction & Mastery Engine.
   */
  static async submitSpeakingReview(
    userId: string,
    promptId: string,
    transcript: string,
    durationSeconds: number = 45
  ) {
    const prompt = C1_SPEAKING_PROMPTS.find((p) => p.id === promptId);
    if (!prompt) {
      throw new Error(`Speaking prompt with id ${promptId} not found.`);
    }

    const evaluation = this.evaluateSpokenUtterance(prompt, transcript, durationSeconds);

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
          explanation: prompt.guidingQuestions.join("; "),
        },
      });
    }

    const reviewResult = await ReviewService.processReviewSubmission({
      userId,
      conceptId: concept.id,
      exerciseType: "SENTENCE_BUILD",
      dimension: "PRODUCTION",
      source: "SPEAKING",
      userAnswer: transcript,
      accuracyScore: evaluation.accuracyScore,
      isCorrect: evaluation.isCorrect,
      timeSpentMs: durationSeconds * 1000,
      metadata: {
        promptId,
        wordsPerMinute: evaluation.fluencyMetrics.wordsPerMinute,
        fillerCount: evaluation.fluencyMetrics.fillerWordsCount,
        targetsFound: evaluation.targetConceptsFound,
      },
    });

    return {
      evaluation,
      submission: reviewResult,
    };
  }
}
