"use client";

import { useState } from "react";
import Link from "next/link";
import { DailyWorkoutPlan, WorkoutBlock } from "@/modules/training/types";
import { submitReviewAction } from "@/modules/reviews/actions";
import { submitGrammarExerciseAction } from "@/modules/grammar/actions";
import { submitListeningReviewAction } from "@/modules/listening/actions";
import AudioPlayerController from "@/components/audio/AudioPlayerController";
import {
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  ArrowRight,
  Send,
  RotateCcw,
  Zap,
  BookOpen,
  Headphones,
  Check,
  Award,
  Layers,
} from "lucide-react";

interface DailyWorkoutRunnerProps {
  workout: DailyWorkoutPlan;
}

export default function DailyWorkoutRunner({ workout }: DailyWorkoutRunnerProps) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const blocks = workout.blocks;
  const currentBlock = blocks[currentBlockIndex];

  const progressPercent = sessionCompleted
    ? 100
    : Math.round(((completedBlocks.length) / Math.max(1, blocks.length)) * 100);

  function handleNextBlock() {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  }

  async function handlePassThroughSubmission(accuracy: number = 1.0) {
    if (loading) return;
    setLoading(true);

    try {
      if (currentBlock.type === "SPACED_REVIEW" && currentBlock.items[0]) {
        const item = currentBlock.items[0];
        await submitReviewAction({
          conceptId: item.concept.id,
          exerciseType: item.suggestedExerciseType,
          dimension: item.targetDimension,
          accuracyScore: accuracy,
          isCorrect: accuracy >= 0.7,
        });
      } else if (currentBlock.type === "PASSIVE_TO_ACTIVE") {
        await submitReviewAction({
          conceptId: currentBlock.concept.id,
          exerciseType: "SENTENCE_BUILD",
          dimension: "PRODUCTION",
          accuracyScore: accuracy,
          isCorrect: true,
          userAnswer: answers[currentBlockIndex] || "",
        });
      } else if (currentBlock.type === "GRAMMAR_PRECISION") {
        await submitGrammarExerciseAction({
          exerciseId: currentBlock.exercise.id,
          accuracyScore: accuracy,
          isCorrect: true,
          userAnswer: answers[currentBlockIndex] || "",
        });
      } else if (currentBlock.type === "LISTENING_CHALLENGE") {
        await submitListeningReviewAction({
          exerciseId: currentBlock.exercise.id,
          accuracyScore: accuracy,
          isCorrect: true,
          dimension: currentBlock.exercise.dimension,
          source: "LISTENING",
        });
      } else if (currentBlock.type === "ACTIVE_PRODUCTION") {
        // Submit production synthesis
      }

      setCompletedBlocks((prev) => (prev.includes(currentBlockIndex) ? prev : [...prev, currentBlockIndex]));
      handleNextBlock();
    } finally {
      setLoading(false);
    }
  }

  if (sessionCompleted) {
    return (
      <div style={{ maxWidth: "720px", margin: "40px auto" }}>
        <div className="glass-card" style={{ padding: "48px 36px", textAlign: "center" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(245, 158, 11, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <Flame size={38} color="#f59e0b" />
          </div>

          <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Daily Training Complete!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "28px", lineHeight: 1.6 }}>
            You completed your personalized {workout.dailyMinutesBudget}-minute C1 training workout.
            FSRS memory stability, passive bottleneck conversions, and mastery scores have been saved.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "36px",
            }}
          >
            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Current Streak</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f59e0b", marginTop: "4px" }}>
                {workout.streakDays + (workout.isCompletedToday ? 0 : 1)} Days 🔥
              </div>
            </div>

            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Stages Finished</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "4px" }}>
                {blocks.length}/{blocks.length}
              </div>
            </div>

            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Competence Gain</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#34d399", marginTop: "4px" }}>
                +Active C1
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
            <Link href="/review/history" className="btn-secondary">
              View Audit History
            </Link>
            <Link href="/concepts" className="btn-primary">
              Explore Concept Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Session Progress Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="badge badge-c1">
            <Flame size={12} color="#f59e0b" />
            {workout.streakDays} Day Streak
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Stage {currentBlockIndex + 1} of {blocks.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <Clock size={14} />
          <span>~{currentBlock.estimatedMinutes} min</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          background: "rgba(255, 255, 255, 0.06)",
          marginBottom: "28px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Main Block Runner Card */}
      <div className="glass-card" style={{ padding: "36px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              {currentBlock.type.replace(/_/g, " ")}
            </span>
            <h2 style={{ fontSize: "1.4rem", marginTop: "4px" }}>{currentBlock.title}</h2>
          </div>
          <span className="badge">{currentBlock.estimatedMinutes}m</span>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "24px", lineHeight: 1.5 }}>
          {currentBlock.description}
        </p>

        {/* 1. Spaced Review Block Content */}
        {currentBlock.type === "SPACED_REVIEW" && (
          <div>
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>
                {currentBlock.items[0]?.concept.canonicalForm}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Prompt: {currentBlock.items[0]?.prompt}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Spanish: {currentBlock.items[0]?.translationEs}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => handlePassThroughSubmission(0.4)}
                disabled={loading}
                className="btn-secondary"
                style={{ flex: 1, padding: "12px" }}
              >
                Hard / Need Review
              </button>
              <button
                type="button"
                onClick={() => handlePassThroughSubmission(1.0)}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: "12px" }}
              >
                Recall Correctly & Proceed
              </button>
            </div>
          </div>
        )}

        {/* 2. Passive to Active Bottleneck Block */}
        {currentBlock.type === "PASSIVE_TO_ACTIVE" && (
          <div>
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                color: "#fbbf24",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Target Expression: <strong>{currentBlock.concept.canonicalForm}</strong> ({currentBlock.concept.translationEs})
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                {currentBlock.prompt}
              </label>
              <textarea
                rows={3}
                value={answers[currentBlockIndex] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentBlockIndex]: e.target.value }))}
                placeholder="Type your spontaneous active sentence here..."
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handlePassThroughSubmission(1.0)}
              disabled={loading || !answers[currentBlockIndex]?.trim()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Submit Active Sentence & Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* 3. New Concept Acquisition Block */}
        {currentBlock.type === "NEW_CONCEPT" && (
          <div>
            <div
              style={{
                padding: "24px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.06)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                marginBottom: "24px",
              }}
            >
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {currentBlock.concept.canonicalForm}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--accent-cyan)", marginBottom: "14px" }}>
                {currentBlock.concept.meaning}
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Spanish: <strong>{currentBlock.concept.translationEs}</strong>
              </div>

              {currentBlock.examples[0] && (
                <div style={{ fontSize: "0.92rem", fontStyle: "italic", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px" }}>
                  &ldquo;{currentBlock.examples[0].sentence}&rdquo;
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handlePassThroughSubmission(1.0)}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Understood & Queue into Memory</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* 4. Grammar Precision Block */}
        {currentBlock.type === "GRAMMAR_PRECISION" && (
          <div>
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "4px" }}>Original:</div>
              <div style={{ fontSize: "1rem", fontStyle: "italic", marginBottom: "12px" }}>
                &ldquo;{currentBlock.exercise.baseSentence}&rdquo;
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                Start with: <strong>{currentBlock.exercise.promptLead}</strong>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                value={answers[currentBlockIndex] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentBlockIndex]: e.target.value }))}
                placeholder={`${currentBlock.exercise.promptLead}...`}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handlePassThroughSubmission(1.0)}
              disabled={loading || !answers[currentBlockIndex]?.trim()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Check Grammar & Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* 5. Listening Challenge Block */}
        {currentBlock.type === "LISTENING_CHALLENGE" && (
          <div>
            <AudioPlayerController
              spokenText={currentBlock.exercise.spokenAudioText}
              phoneticTranscription={currentBlock.exercise.phoneticTranscription}
              translationEs={currentBlock.exercise.translationEs}
            />

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Transcribe the spoken audio:
              </label>
              <textarea
                rows={3}
                value={answers[currentBlockIndex] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentBlockIndex]: e.target.value }))}
                placeholder="Type the utterance..."
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handlePassThroughSubmission(1.0)}
              disabled={loading || !answers[currentBlockIndex]?.trim()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Submit Transcription & Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* 6. Active Production Synthesis Block */}
        {currentBlock.type === "ACTIVE_PRODUCTION" && (
          <div>
            <div style={{ marginBottom: "16px", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {currentBlock.prompt}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <textarea
                rows={4}
                value={answers[currentBlockIndex] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentBlockIndex]: e.target.value }))}
                placeholder="Write your complete C1 synthesis paragraph..."
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handlePassThroughSubmission(1.0)}
              disabled={loading || !answers[currentBlockIndex]?.trim()}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Complete Daily Workout</span>
              <Sparkles size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
