import { prisma } from "@/db/prisma";
import {
  ListeningCategory,
  ListeningExercise,
  ListeningEvaluationResult,
} from "./types";
import { C1_LISTENING_EXERCISES } from "./listening-seed";
import { ReviewService } from "@/modules/reviews/review.service";
import { EvidenceDimension } from "@prisma/client";

export class ListeningService {
  /**
   * Retrieves structured C1 listening categories and tracks.
   */
  static getListeningTracks() {
    const categories: Array<{
      category: ListeningCategory;
      title: string;
      description: string;
      badge: string;
      exerciseCount: number;
    }> = [
      {
        category: "CONNECTED_SPEECH",
        title: "Connected Speech & Phonetic Reductions",
        description: "Decode native assimilation, elision, weak forms, and linking consonants in conversational flow.",
        badge: "Acoustic Decoding",
        exerciseCount: C1_LISTENING_EXERCISES.filter((e) => e.category === "CONNECTED_SPEECH").length,
      },
      {
        category: "FAST_DICTATION",
        title: "Fast-Speech Micro-Dictation",
        description: "Transcribe rapid C1 audio clips to build real-time acoustic parsing and contraction resilience.",
        badge: "Precision Parsing",
        exerciseCount: C1_LISTENING_EXERCISES.filter((e) => e.category === "FAST_DICTATION").length,
      },
      {
        category: "BOARDROOM_COMPREHENSION",
        title: "Executive & Academic Comprehension",
        description: "Parse dense multi-speaker arguments, strategic nuance, tone shifts, and implicit conclusions.",
        badge: "Strategic Nuance",
        exerciseCount: C1_LISTENING_EXERCISES.filter((e) => e.category === "BOARDROOM_COMPREHENSION").length,
      },
      {
        category: "SHADOWING_LAB",
        title: "Shadowing Lab & Rhythm Alignment",
        description: "Synchronize speech rate, pitch movements, pausing, and tonic stress with native speech models.",
        badge: "Cadence & Prosody",
        exerciseCount: C1_LISTENING_EXERCISES.filter((e) => e.category === "SHADOWING_LAB").length,
      },
    ];

    return categories;
  }

  /**
   * Retrieves listening exercises by category or all.
   */
  static getListeningExercises(category?: ListeningCategory): ListeningExercise[] {
    if (!category) return C1_LISTENING_EXERCISES;
    return C1_LISTENING_EXERCISES.filter((e) => e.category === category);
  }

  /**
   * Evaluates a dictation transcription against the target spoken audio text.
   */
  static evaluateDictation(
    exercise: ListeningExercise,
    userTranscript: string
  ): ListeningEvaluationResult {
    const raw = userTranscript.trim();
    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[.,!?;:"'—–-]/g, "")
        .replace(/\bgonna\b/g, "going to")
        .replace(/\bwanna\b/g, "want to")
        .replace(/\bgotta\b/g, "got to")
        .replace(/\bshouldve\b/g, "should have")
        .replace(/\bwouldve\b/g, "would have")
        .replace(/\bcouldve\b/g, "could have")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedInput = normalize(raw);
    const normalizedTarget = normalize(exercise.spokenAudioText);

    // Exact Match
    if (normalizedInput === normalizedTarget) {
      return {
        isCorrect: true,
        accuracyScore: 1.0,
        feedback: "Flawless transcription! You decoded all rapid speech and connected sounds perfectly.",
        transcript: exercise.spokenAudioText,
        phoneticTranscription: exercise.phoneticTranscription,
        missedWords: [],
        connectedSpeechHighlights: exercise.connectedSpeechFeatures,
      };
    }

    // Token-level accuracy computation
    const targetWords = normalizedTarget.split(" ").filter(Boolean);
    const inputWords = normalizedInput.split(" ").filter(Boolean);

    let matchCount = 0;
    const missedWords: string[] = [];

    for (const targetWord of targetWords) {
      if (inputWords.includes(targetWord)) {
        matchCount++;
      } else {
        missedWords.push(targetWord);
      }
    }

    const accuracyScore =
      targetWords.length > 0
        ? Math.round((matchCount / targetWords.length) * 1000) / 1000
        : 0.0;

    const isCorrect = accuracyScore >= 0.85;

    let feedback = "";
    if (isCorrect) {
      feedback = "Great transcription! Minor variance, but you accurately captured the core message and phrasing.";
    } else if (accuracyScore >= 0.5) {
      feedback = `Partial transcription (${Math.round(accuracyScore * 100)}%). Notice the acoustic reductions: ${exercise.connectedSpeechFeatures[0] || "connected speech"}.`;
    } else {
      feedback = `Transcription needs review (${Math.round(accuracyScore * 100)}%). Listen for the connected speech patterns indicated below.`;
    }

    return {
      isCorrect,
      accuracyScore,
      feedback,
      transcript: exercise.spokenAudioText,
      phoneticTranscription: exercise.phoneticTranscription,
      missedWords: missedWords.slice(0, 4),
      connectedSpeechHighlights: exercise.connectedSpeechFeatures,
    };
  }

  /**
   * Evaluates multiple choice comprehension answers for listening passages.
   */
  static evaluateComprehension(
    exercise: ListeningExercise,
    selectedAnswers: Record<string, number>
  ): { isCorrect: boolean; accuracyScore: number; feedback: string } {
    const questions = exercise.comprehensionQuestions || [];
    if (questions.length === 0) {
      return { isCorrect: true, accuracyScore: 1.0, feedback: "Comprehension completed." };
    }

    let correctCount = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    }

    const accuracyScore = Math.round((correctCount / questions.length) * 100) / 100;
    const isCorrect = correctCount === questions.length;

    return {
      isCorrect,
      accuracyScore,
      feedback: isCorrect
        ? "Excellent comprehension! You inferred the subtle nuance and executive recommendations correctly."
        : `You answered ${correctCount} of ${questions.length} questions correctly. Review the audio explanation.`,
    };
  }

  /**
   * Records a listening drill submission into the atomic Review Transaction and Mastery Engine.
   */
  static async submitListeningReview(
    userId: string,
    exerciseId: string,
    accuracyScore: number,
    isCorrect: boolean,
    dimension: EvidenceDimension = "RECALL",
    source: "LISTENING" | "SHADOWING" = "LISTENING"
  ) {
    const exercise = C1_LISTENING_EXERCISES.find((e) => e.id === exerciseId);
    const canonicalForm = exercise ? exercise.title : "C1 Listening Passage";

    let concept = await prisma.learningConcept.findFirst({
      where: { canonicalForm },
    });

    if (!concept) {
      concept = await prisma.learningConcept.create({
        data: {
          type: "SENTENCE_PATTERN",
          canonicalForm,
          meaning: exercise?.scenario ?? "C1 Listening & Connected Speech Pattern",
          translationEs: exercise?.translationEs ?? "Patrón auditivo C1",
          cefrLevel: "C1",
          explanation: exercise?.connectedSpeechFeatures.join("; "),
          phonetics: exercise?.phoneticTranscription,
        },
      });
    }

    return ReviewService.processReviewSubmission({
      userId,
      conceptId: concept.id,
      exerciseType: source === "SHADOWING" ? "SENTENCE_BUILD" : "RECALL",
      dimension,
      source,
      accuracyScore,
      isCorrect,
      metadata: {
        exerciseId,
        category: exercise?.category,
      },
    });
  }
}
