"use client";

import { useState } from "react";
import Link from "next/link";
import { ReviewQueueItem, ReviewSubmissionResult } from "@/modules/reviews/types";
import { submitReviewAction } from "@/modules/reviews/actions";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Brain,
  RotateCcw,
  Check,
  Zap,
} from "lucide-react";

interface ReviewSessionProps {
  initialQueue: ReviewQueueItem[];
}

export default function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const [queue] = useState<ReviewQueueItem[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewSubmissionResult | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [startTime] = useState<number>(Date.now());

  if (queue.length === 0) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "48px 32px" }}>
          <CheckCircle2 size={48} color="#34d399" style={{ margin: "0 auto 16px auto" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>All Caught Up!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>
            You have no reviews due right now. Visit the Concepts Library to discover and queue new C1 expressions.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Link href="/concepts" className="btn-primary">
              Explore Concepts
            </Link>
            <Link href="/review/history" className="btn-secondary">
              View Review History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFinished = currentIndex >= queue.length;
  if (isFinished) {
    return (
      <div style={{ maxWidth: "680px", margin: "40px auto" }}>
        <div className="glass-card" style={{ padding: "48px 36px", textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "rgba(16, 185, 129, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <Sparkles size={30} color="#34d399" />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Session Complete!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "28px" }}>
            You reviewed {completedCount} concepts. FSRS memory stability and mastery metrics have been updated.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Reviewed</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: "4px" }}>{completedCount}</div>
            </div>
            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Memory Engine</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "4px" }}>
                FSRS v5
              </div>
            </div>
            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Audit Trail</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#34d399", marginTop: "4px" }}>Saved</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
            <Link href="/concepts" className="btn-secondary">
              Concepts Library
            </Link>
            <Link href="/review/history" className="btn-primary">
              Review History Audit
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const current = queue[currentIndex];
  const progressPercent = ((currentIndex + 1) / queue.length) * 100;

  async function handleAnswerSubmit(isCorrectOverride?: boolean, scoreOverride?: number) {
    if (loading) return;
    setLoading(true);

    const timeSpentMs = Date.now() - startTime;
    let isCorrect = false;
    let accuracyScore = 0.0;

    if (current.suggestedExerciseType === "RECOGNITION") {
      isCorrect = isCorrectOverride ?? selectedOption === current.concept.meaning;
      accuracyScore = isCorrect ? 1.0 : 0.0;
    } else if (current.suggestedExerciseType === "CLOZE") {
      const normalizedInput = userAnswer.trim().toLowerCase();
      const normalizedTarget = current.correctAnswer.toLowerCase();
      isCorrect = normalizedInput === normalizedTarget;
      accuracyScore = isCorrect ? 1.0 : normalizedInput.length > 2 && normalizedTarget.includes(normalizedInput) ? 0.5 : 0.0;
    } else {
      isCorrect = isCorrectOverride ?? true;
      accuracyScore = scoreOverride ?? (isCorrect ? 0.9 : 0.4);
    }

    try {
      const res = await submitReviewAction({
        conceptId: current.concept.id,
        exerciseType: current.suggestedExerciseType,
        dimension: current.targetDimension,
        accuracyScore,
        isCorrect,
        hintsUsed,
        timeSpentMs,
        userAnswer: current.suggestedExerciseType === "RECOGNITION" ? (selectedOption ?? "") : userAnswer,
      });

      if (res.success && res.data) {
        setResult(res.data);
        setCompletedCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleNextCard() {
    setResult(null);
    setUserAnswer("");
    setSelectedOption(null);
    setShowHint(false);
    setHintsUsed(0);
    setCurrentIndex((prev) => prev + 1);
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      {/* Session Progress Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="badge badge-c1">
            <Zap size={12} />
            Active Retrieval Session
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Card {currentIndex + 1} of {queue.length}
          </span>
        </div>
        <Link href="/review/history" style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
          View History
        </Link>
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

      {/* Main Review Card */}
      <div className="glass-card" style={{ padding: "36px 32px" }}>
        {/* Card Metadata */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            Mode: {current.suggestedExerciseType} ({current.targetDimension})
          </span>
          <span className="badge">{current.concept.cefrLevel}</span>
        </div>

        {/* Exercise Prompt */}
        <h2 style={{ fontSize: "1.4rem", marginBottom: "20px", lineHeight: 1.4 }}>
          {current.prompt}
        </h2>

        {/* Recognition Multiple Choice Mode */}
        {current.suggestedExerciseType === "RECOGNITION" && current.options && !result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              {current.concept.canonicalForm}
            </div>
            {current.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedOption(opt)}
                style={{
                  padding: "14px 18px",
                  borderRadius: "10px",
                  background: selectedOption === opt ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: selectedOption === opt ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  textAlign: "left",
                  fontSize: "0.92rem",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Cloze / Fill in Blank Mode */}
        {current.suggestedExerciseType === "CLOZE" && !result && (
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                fontSize: "1.05rem",
                lineHeight: 1.6,
                marginBottom: "20px",
                fontStyle: "italic",
              }}
            >
              &ldquo;{current.clozeSentence}&rdquo;
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Type the exact expression (Canonical Form):
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && userAnswer.trim()) {
                    handleAnswerSubmit();
                  }
                }}
                placeholder="e.g. figure out"
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
          </div>
        )}

        {/* Sentence Build / Production Mode */}
        {current.suggestedExerciseType === "SENTENCE_BUILD" && !result && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
              {current.concept.canonicalForm}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Meaning: {current.concept.meaning}
            </div>
            <textarea
              rows={3}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write a complete, natural sentence using this expression..."
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
        )}

        {/* Hint Section */}
        {!result && (
          <div style={{ marginBottom: "24px" }}>
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
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: 0,
              }}
            >
              <HelpCircle size={15} />
              <span>{showHint ? "Hint revealed (FSRS rating calibrated)" : "Need a hint? (Spanish gloss)"}</span>
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
                  fontSize: "0.88rem",
                }}
              >
                Spanish Translation: <strong>{current.translationEs}</strong>
              </div>
            )}
          </div>
        )}

        {/* Action Button before submission */}
        {!result && (
          <div>
            <button
              type="button"
              onClick={() => handleAnswerSubmit()}
              disabled={loading || (current.suggestedExerciseType === "RECOGNITION" ? !selectedOption : !userAnswer.trim())}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              {loading ? "Evaluating Answer..." : "Submit Answer"}
            </button>
          </div>
        )}

        {/* Evaluation Result Feedback */}
        {result && (
          <div
            style={{
              marginTop: "16px",
              padding: "24px",
              borderRadius: "14px",
              background: result.rating === "AGAIN" ? "rgba(244, 63, 94, 0.1)" : "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${result.rating === "AGAIN" ? "rgba(244, 63, 94, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              {result.rating === "AGAIN" ? (
                <XCircle size={28} color="#f43f5e" />
              ) : (
                <CheckCircle2 size={28} color="#34d399" />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {result.rating === "AGAIN" ? "Review Needed" : "Correct / Well Done!"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Target: <strong>{current.concept.canonicalForm}</strong> ({current.concept.meaning})
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>FSRS Rating</div>
                <div style={{ fontWeight: 700, color: "var(--accent-cyan)", fontSize: "1rem" }}>
                  {result.rating}
                </div>
              </div>

              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Next Review Due</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {result.scheduledDays === 0 ? "Today" : `In ${result.scheduledDays}d`}
                </div>
              </div>

              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mastery State</div>
                <div style={{ fontWeight: 700, color: "#818cf8", fontSize: "0.95rem" }}>
                  {result.newMasteryState}
                </div>
              </div>

              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Overall Mastery</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {Math.round(result.newOverallMastery * 100)}%
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextCard}
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
            >
              <span>Continue to Next Card</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
