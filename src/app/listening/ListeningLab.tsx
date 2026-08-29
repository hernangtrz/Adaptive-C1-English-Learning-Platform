"use client";

import { useState } from "react";
import { ListeningExercise, ListeningEvaluationResult } from "@/modules/listening/types";
import { ListeningService } from "@/modules/listening/listening.service";
import { submitListeningReviewAction } from "@/modules/listening/actions";
import AudioPlayerController from "@/components/audio/AudioPlayerController";
import {
  Headphones,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  Mic,
  Activity,
} from "lucide-react";
import { ReviewSubmissionResult } from "@/modules/reviews/types";

interface ListeningLabProps {
  exercises: ListeningExercise[];
}

export default function ListeningLab({ exercises }: ListeningLabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranscript, setUserTranscript] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    evaluation: ListeningEvaluationResult | { isCorrect: boolean; accuracyScore: number; feedback: string };
    submission?: ReviewSubmissionResult;
  } | null>(null);

  const current = exercises[currentIndex];

  if (!current) {
    return null;
  }

  const isComprehension = current.category === "BOARDROOM_COMPREHENSION" && current.comprehensionQuestions;
  const isShadowing = current.category === "SHADOWING_LAB";

  async function handleEvaluateAndSubmit() {
    if (loading) return;
    setLoading(true);

    let evaluation: ListeningEvaluationResult | { isCorrect: boolean; accuracyScore: number; feedback: string };

    if (isComprehension) {
      evaluation = ListeningService.evaluateComprehension(current, selectedAnswers);
    } else {
      evaluation = ListeningService.evaluateDictation(current, userTranscript);
    }

    try {
      const res = await submitListeningReviewAction({
        exerciseId: current.id,
        accuracyScore: evaluation.accuracyScore,
        isCorrect: evaluation.isCorrect,
        dimension: current.dimension,
        source: isShadowing ? "SHADOWING" : "LISTENING",
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
    setUserTranscript("");
    setSelectedAnswers({});
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % exercises.length);
  }

  function handleReset() {
    setResult(null);
    setUserTranscript("");
    setSelectedAnswers({});
    setShowHint(false);
  }

  return (
    <div className="glass-card" style={{ padding: "36px 32px" }}>
      {/* Exercise Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            {current.category.replace("_", " ")} — Exercise {currentIndex + 1} of {exercises.length}
          </div>
          <h2 style={{ fontSize: "1.4rem", marginTop: "2px" }}>{current.title}</h2>
        </div>
        <span className="badge badge-c1">C1 Acoustic Lab</span>
      </div>

      {/* Scenario Brief */}
      <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "20px", lineHeight: 1.5 }}>
        {current.scenario}
      </p>

      {/* Audio Controller */}
      <AudioPlayerController
        spokenText={current.spokenAudioText}
        phoneticTranscription={current.phoneticTranscription}
        translationEs={current.translationEs}
      />

      {/* Interactive Mode Content */}
      {!result && (
        <div style={{ marginBottom: "24px" }}>
          {/* Comprehension Questions Mode */}
          {isComprehension && current.comprehensionQuestions ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {current.comprehensionQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <h4 style={{ fontSize: "1rem", marginBottom: "12px" }}>
                    {qIndex + 1}. {q.question}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedAnswers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                          style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: isSelected ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                            border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            textAlign: "left",
                            fontSize: "0.88rem",
                            cursor: "pointer",
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : isShadowing ? (
            /* Shadowing Mode */
            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.06)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", marginBottom: "8px" }}>
                <Mic size={18} />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Shadowing & Cadence Synchronization</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "16px" }}>
                Listen to the audio clip multiple times. Practice speaking along simultaneously to align your rhythm,
                intonation rise, and pausing.
              </p>
              <div style={{ fontSize: "1.1rem", fontStyle: "italic", marginBottom: "12px" }}>
                &ldquo;{current.spokenAudioText}&rdquo;
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {current.connectedSpeechFeatures.map((feat, i) => (
                  <span key={i} className="badge" style={{ fontSize: "0.72rem" }}>
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Fast Dictation Mode */
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Transcribe the exact spoken utterance (Micro-Listening):
              </label>
              <textarea
                rows={3}
                value={userTranscript}
                onChange={(e) => setUserTranscript(e.target.value)}
                placeholder="Type the full spoken sentence here..."
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.98rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {/* Hint Toggle */}
          <div style={{ marginTop: "14px" }}>
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
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
              <span>{showHint ? "Hide Acoustic Clue" : "Need an acoustic clue?"}</span>
            </button>
            {showHint && (
              <div
                style={{
                  marginTop: "6px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  color: "#fbbf24",
                  fontSize: "0.85rem",
                }}
              >
                {current.hint}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evaluation Feedback */}
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
              Score: {Math.round(result.evaluation.accuracyScore * 100)}%
            </span>
            {result.submission && (
              <span className="badge" style={{ marginLeft: "auto", fontSize: "0.72rem" }}>
                FSRS: {result.submission.rating} (Due {result.submission.scheduledDays === 0 ? "Today" : `in ${result.submission.scheduledDays}d`})
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.92rem", color: "var(--text-primary)", marginBottom: "12px" }}>
            {result.evaluation.feedback}
          </p>

          {"transcript" in result.evaluation && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Target Utterance:</div>
              <div style={{ fontSize: "0.95rem", fontStyle: "italic", marginTop: "2px" }}>
                &ldquo;{result.evaluation.transcript}&rdquo;
              </div>
            </div>
          )}

          {"connectedSpeechHighlights" in result.evaluation && result.evaluation.connectedSpeechHighlights && (
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", marginBottom: "4px" }}>
                Connected Speech Features to Note:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {result.evaluation.connectedSpeechHighlights.map((h, i) => (
                  <span key={i} className="badge" style={{ fontSize: "0.72rem" }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        {!result ? (
          <button
            type="button"
            onClick={handleEvaluateAndSubmit}
            disabled={loading || (!isComprehension && !isShadowing && !userTranscript.trim())}
            className="btn-primary"
            style={{ width: "100%", padding: "14px" }}
          >
            {loading ? (
              "Evaluating Acoustic Parsing..."
            ) : (
              <>
                <span>{isShadowing ? "Complete Shadowing Repetition" : "Evaluate Transcription"}</span>
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
              <span>Next Audio Exercise</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
