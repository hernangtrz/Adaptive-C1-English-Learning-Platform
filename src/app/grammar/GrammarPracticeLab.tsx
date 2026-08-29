"use client";

import { useState } from "react";
import {
  GrammarTransformationExercise,
  GrammarErrorIdentificationExercise,
  GrammarEvaluationResult,
} from "@/modules/grammar/types";
import { GrammarService } from "@/modules/grammar/grammar.service";
import { submitGrammarExerciseAction } from "@/modules/grammar/actions";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Send,
  RotateCcw,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { ReviewSubmissionResult } from "@/modules/reviews/types";

interface GrammarPracticeLabProps {
  transformations: GrammarTransformationExercise[];
  errors: GrammarErrorIdentificationExercise[];
}

export default function GrammarPracticeLab({
  transformations,
  errors,
}: GrammarPracticeLabProps) {
  const [activeMode, setActiveMode] = useState<"transformations" | "errors">("transformations");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    evaluation: GrammarEvaluationResult;
    submission?: ReviewSubmissionResult;
  } | null>(null);

  const currentList = activeMode === "transformations" ? transformations : errors;
  const currentItem = currentList[currentIndex];

  function handleSwitchMode(mode: "transformations" | "errors") {
    setActiveMode(mode);
    setCurrentIndex(0);
    setUserAnswer("");
    setShowHint(false);
    setHintsUsed(0);
    setResult(null);
  }

  async function handleEvaluateAndSubmit() {
    if (!userAnswer.trim() || loading || !currentItem) return;
    setLoading(true);

    let evaluation: GrammarEvaluationResult;
    if (activeMode === "transformations") {
      evaluation = GrammarService.evaluateTransformation(
        currentItem as GrammarTransformationExercise,
        userAnswer
      );
    } else {
      evaluation = GrammarService.evaluateErrorCorrection(
        currentItem as GrammarErrorIdentificationExercise,
        userAnswer
      );
    }

    try {
      const res = await submitGrammarExerciseAction({
        exerciseId: currentItem.id,
        userAnswer,
        accuracyScore: evaluation.accuracyScore,
        isCorrect: evaluation.isCorrect,
        hintsUsed,
      });

      setResult({
        evaluation,
        submission: res.success ? res.data : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    setResult(null);
    setUserAnswer("");
    setShowHint(false);
    setHintsUsed(0);
    setCurrentIndex((prev) => (prev + 1) % currentList.length);
  }

  function handleReset() {
    setResult(null);
    setUserAnswer("");
    setShowHint(false);
  }

  if (!currentItem) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: "36px 32px" }}>
      {/* Mode Switcher Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            Interactive Grammar Lab
          </div>
          <h2 style={{ fontSize: "1.4rem", marginTop: "2px" }}>
            {activeMode === "transformations" ? "C1 Sentence Transformations" : "Error Spotting & Syntax Fix"}
          </h2>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => handleSwitchMode("transformations")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              background: activeMode === "transformations" ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
              color: activeMode === "transformations" ? "#ffffff" : "var(--text-secondary)",
              border: activeMode === "transformations" ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
            }}
          >
            Transformations ({transformations.length})
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("errors")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              background: activeMode === "errors" ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
              color: activeMode === "errors" ? "#67e8f9" : "var(--text-secondary)",
              border: activeMode === "errors" ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
            }}
          >
            Error Spotting ({errors.length})
          </button>
        </div>
      </div>

      {/* Exercise Card */}
      <div
        style={{
          padding: "24px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            {currentItem.category.replace("_", " ")} — Exercise {currentIndex + 1} of {currentList.length}
          </span>
          <span className="badge badge-c1">C1 Level</span>
        </div>

        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>{currentItem.title}</h3>

        {/* Base Sentence / Erroneous Sentence Display */}
        {activeMode === "transformations" ? (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              Original Statement:
            </div>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                fontSize: "1.05rem",
                lineHeight: 1.5,
              }}
            >
              &ldquo;{(currentItem as GrammarTransformationExercise).baseSentence}&rdquo;
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "12px" }}>
              Rewrite the sentence starting with:{" "}
              <strong style={{ color: "var(--accent-cyan)" }}>
                {(currentItem as GrammarTransformationExercise).promptLead}
              </strong>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              Contains a Grammatical Syntax Error:
            </div>
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                background: "rgba(244, 63, 94, 0.06)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                fontSize: "1.05rem",
                lineHeight: 1.5,
              }}
            >
              &ldquo;{(currentItem as GrammarErrorIdentificationExercise).erroneousSentence}&rdquo;
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "12px" }}>
              Identify the error and type the corrected complete sentence:
            </div>
          </div>
        )}

        {/* Input Box */}
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            disabled={Boolean(result)}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userAnswer.trim() && !result) {
                handleEvaluateAndSubmit();
              }
            }}
            placeholder={
              activeMode === "transformations"
                ? `${(currentItem as GrammarTransformationExercise).promptLead}...`
                : "Type the corrected sentence..."
            }
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              outline: "none",
            }}
          />
        </div>

        {/* Hint toggle */}
        {!result && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (!showHint) {
                  setShowHint(true);
                  setHintsUsed((prev) => prev + 1);
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-amber)",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: 0,
              }}
            >
              <HelpCircle size={14} />
              <span>{showHint ? "Grammar Hint Active" : "Need a grammar clue?"}</span>
            </button>
            {showHint && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  color: "#fbbf24",
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                }}
              >
                {currentItem.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result & Evaluation Feedback */}
      {result && (
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: result.evaluation.isCorrect ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
            border: `1px solid ${result.evaluation.isCorrect ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            {result.evaluation.isCorrect ? (
              <CheckCircle2 size={22} color="#34d399" />
            ) : (
              <XCircle size={22} color="#f43f5e" />
            )}
            <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {result.evaluation.isCorrect ? "Correct Transformation!" : `Score: ${Math.round(result.evaluation.accuracyScore * 100)}%`}
            </span>
            {result.submission && (
              <span className="badge" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>
                FSRS: {result.submission.rating} (Due {result.submission.scheduledDays === 0 ? "Today" : `in ${result.submission.scheduledDays}d`})
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", marginBottom: "8px" }}>
            {result.evaluation.feedback}
          </p>

          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "6px" }}>
            Target Form: &ldquo;{result.evaluation.correctAnswer}&rdquo;
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Spanish: {currentItem.translationEs}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        {!result ? (
          <button
            type="button"
            onClick={handleEvaluateAndSubmit}
            disabled={!userAnswer.trim() || loading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px" }}
          >
            {loading ? (
              "Evaluating Syntax..."
            ) : (
              <>
                <span>Check Transformation</span>
                <Send size={15} />
              </>
            )}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              style={{ flex: 1, padding: "14px", gap: "8px" }}
            >
              <RotateCcw size={16} />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{ flex: 1, padding: "14px", gap: "8px" }}
            >
              <span>Next Exercise</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
