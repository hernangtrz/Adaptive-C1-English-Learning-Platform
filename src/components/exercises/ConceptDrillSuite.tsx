"use client";

import { useState } from "react";
import { VocabularyExerciseSuite } from "@/modules/exercises/types";
import { ExerciseGeneratorService } from "@/modules/exercises/generator.service";
import { submitReviewAction } from "@/modules/reviews/actions";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Brain,
  Send,
  RotateCcw,
} from "lucide-react";
import { ReviewSubmissionResult } from "@/modules/reviews/types";

interface ConceptDrillSuiteProps {
  suite: VocabularyExerciseSuite;
}

export default function ConceptDrillSuite({ suite }: ConceptDrillSuiteProps) {
  const [activeStep, setActiveStep] = useState<"recognition" | "cloze" | "collocation" | "production">("recognition");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [hintsCount, setHintsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, { evaluation: { isCorrect: boolean; accuracyScore: number; feedback: string; correctAnswer: string }; submission?: ReviewSubmissionResult }>>({});

  const steps = [
    { id: "recognition", label: "1. Recognition", type: "Multiple Choice", dim: "RECOGNITION" },
    { id: "cloze", label: "2. Contextual Recall", type: "Cloze Sentence", dim: "RECALL" },
    { id: "collocation", label: "3. Collocation Pairing", type: "Structure Match", dim: "RECALL" },
    { id: "production", label: "4. Controlled Production", type: "Sentence Build", dim: "PRODUCTION" },
  ] as const;

  const currentExercise =
    activeStep === "recognition"
      ? suite.recognition
      : activeStep === "cloze"
      ? suite.cloze
      : activeStep === "collocation"
      ? suite.collocation
      : suite.production;

  const currentAnswer = userAnswers[activeStep] || "";
  const currentResult = results[activeStep];
  const isHintShown = showHint[activeStep] || false;

  async function handleEvaluateAndSubmit() {
    if (!currentAnswer.trim() || loading) return;
    setLoading(true);

    // 1. Evaluate answer deterministically
    const evaluation = ExerciseGeneratorService.evaluateAnswer(currentExercise, currentAnswer);

    // 2. Submit to Review Engine to update user mastery and FSRS
    const hintsUsed = hintsCount[activeStep] || 0;
    try {
      const res = await submitReviewAction({
        conceptId: suite.conceptId,
        exerciseType: currentExercise.type,
        dimension: currentExercise.dimension,
        accuracyScore: evaluation.accuracyScore,
        isCorrect: evaluation.isCorrect,
        hintsUsed,
        userAnswer: currentAnswer,
      });

      setResults((prev) => ({
        ...prev,
        [activeStep]: {
          evaluation,
          submission: res.success ? res.data : undefined,
        },
      }));
    } finally {
      setLoading(false);
    }
  }

  function handleResetCurrent() {
    setResults((prev) => {
      const copy = { ...prev };
      delete copy[activeStep];
      return copy;
    });
    setUserAnswers((prev) => ({ ...prev, [activeStep]: "" }));
    setShowHint((prev) => ({ ...prev, [activeStep]: false }));
  }

  return (
    <div className="glass-card" style={{ padding: "32px 28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            Passive ➔ Active Progression Drill
          </div>
          <h3 style={{ fontSize: "1.3rem", marginTop: "2px" }}>Practice "{suite.canonicalForm}"</h3>
        </div>
        <span className="badge badge-c1">4-Step Progression</span>
      </div>

      {/* Progression Step Tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {steps.map((s) => {
          const isActive = activeStep === s.id;
          const isDone = Boolean(results[s.id]);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStep(s.id)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                background: isActive
                  ? "rgba(99, 102, 241, 0.25)"
                  : isDone
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(255, 255, 255, 0.03)",
                border: isActive
                  ? "2px solid var(--primary)"
                  : isDone
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid var(--border-subtle)",
                color: isActive ? "#ffffff" : isDone ? "#34d399" : "var(--text-secondary)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{s.label}</span>
                {isDone && <CheckCircle2 size={14} color="#34d399" />}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.dim}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      <div
        style={{
          padding: "24px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--border-subtle)",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
          {currentExercise.instruction}
        </div>
        <h4 style={{ fontSize: "1.15rem", marginBottom: "18px", lineHeight: 1.4 }}>{currentExercise.prompt}</h4>

        {/* Step 1: Recognition Multiple Choice */}
        {activeStep === "recognition" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {suite.recognition.options.map((opt, idx) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={Boolean(currentResult)}
                  onClick={() => setUserAnswers((prev) => ({ ...prev, recognition: opt }))}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    textAlign: "left",
                    fontSize: "0.9rem",
                    cursor: currentResult ? "default" : "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Contextual Cloze */}
        {activeStep === "cloze" && (
          <div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                fontSize: "1rem",
                fontStyle: "italic",
                lineHeight: 1.5,
                marginBottom: "16px",
              }}
            >
              &ldquo;{suite.cloze.clozeSentence}&rdquo;
            </div>
            <input
              type="text"
              disabled={Boolean(currentResult)}
              value={currentAnswer}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, cloze: e.target.value }))}
              placeholder="Type the target expression..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Step 3: Collocation Pairing */}
        {activeStep === "collocation" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            {suite.collocation.options.map((opt, idx) => {
              const isSelected = currentAnswer === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={Boolean(currentResult)}
                  onClick={() => setUserAnswers((prev) => ({ ...prev, collocation: opt }))}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    border: isSelected ? "2px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    cursor: currentResult ? "default" : "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 4: Controlled Production */}
        {activeStep === "production" && (
          <div>
            <textarea
              rows={3}
              disabled={Boolean(currentResult)}
              value={currentAnswer}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, production: e.target.value }))}
              placeholder="Write a complete, authentic sentence using this target expression..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        )}

        {/* Hint toggle */}
        {!currentResult && currentExercise.hint && (
          <div style={{ marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => {
                if (!isHintShown) {
                  setShowHint((prev) => ({ ...prev, [activeStep]: true }));
                  setHintsCount((prev) => ({ ...prev, [activeStep]: (prev[activeStep] || 0) + 1 }));
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
              <span>{isHintShown ? "Hint Active" : "Reveal Hint"}</span>
            </button>
            {isHintShown && (
              <div
                style={{
                  marginTop: "6px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  color: "#fbbf24",
                  fontSize: "0.82rem",
                }}
              >
                {currentExercise.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result & Evaluation Feedback */}
      {currentResult && (
        <div
          style={{
            padding: "18px 20px",
            borderRadius: "10px",
            background: currentResult.evaluation.isCorrect ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
            border: `1px solid ${currentResult.evaluation.isCorrect ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            {currentResult.evaluation.isCorrect ? (
              <CheckCircle2 size={20} color="#34d399" />
            ) : (
              <XCircle size={20} color="#f43f5e" />
            )}
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {currentResult.evaluation.isCorrect ? "Score: 100%" : `Score: ${Math.round(currentResult.evaluation.accuracyScore * 100)}%`}
            </span>
            {currentResult.submission && (
              <span className="badge" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>
                FSRS: {currentResult.submission.rating} (Due {currentResult.submission.scheduledDays === 0 ? "Today" : `in ${currentResult.submission.scheduledDays}d`})
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
            {currentResult.evaluation.feedback}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        {!currentResult ? (
          <button
            type="button"
            onClick={handleEvaluateAndSubmit}
            disabled={!currentAnswer.trim() || loading}
            className="btn-primary"
            style={{ width: "100%", padding: "12px" }}
          >
            {loading ? (
              "Evaluating..."
            ) : (
              <>
                <span>Check & Submit</span>
                <Send size={15} />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResetCurrent}
            className="btn-secondary"
            style={{ width: "100%", padding: "12px", gap: "8px" }}
          >
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
