"use client";

import { useState } from "react";
import { SpeakingPrompt, SpeakingEvaluationResult } from "@/modules/speaking/types";
import { submitSpeakingAttemptAction } from "@/modules/speaking/actions";
import AudioVoiceRecorder from "@/components/audio/AudioVoiceRecorder";
import {
  Mic,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Zap,
  BookOpen,
  Award,
  Layers,
} from "lucide-react";
import { ReviewSubmissionResult } from "@/modules/reviews/types";

interface SpeakingSimulationRoomProps {
  prompts: SpeakingPrompt[];
}

export default function SpeakingSimulationRoom({
  prompts,
}: SpeakingSimulationRoomProps) {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    evaluation: SpeakingEvaluationResult;
    submission?: ReviewSubmissionResult;
  } | null>(null);

  const prompt = prompts[selectedPromptIndex];

  if (!prompt) return null;

  async function handleTranscriptSubmission(transcript: string, durationSeconds: number) {
    if (loading) return;
    setLoading(true);

    try {
      const res = await submitSpeakingAttemptAction({
        promptId: prompt.id,
        transcript,
        durationSeconds,
      });

      if (res.success && res.data) {
        setResult(res.data);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleNextPrompt() {
    setResult(null);
    setSelectedPromptIndex((prev) => (prev + 1) % prompts.length);
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div className="glass-card" style={{ padding: "36px 32px" }}>
      {/* Simulation Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            {prompt.category.replace(/_/g, " ")} — Scenario {selectedPromptIndex + 1} of {prompts.length}
          </div>
          <h2 style={{ fontSize: "1.5rem", marginTop: "2px" }}>{prompt.title}</h2>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {prompts.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPromptIndex(idx);
                setResult(null);
              }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: selectedPromptIndex === idx ? "var(--primary)" : "rgba(255, 255, 255, 0.03)",
                border: selectedPromptIndex === idx ? "none" : "1px solid var(--border-subtle)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Role & Scenario Card */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "12px",
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          marginBottom: "24px",
        }}
      >
        <div style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
          Your Assigned Role:
        </div>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>
          {prompt.role}
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: "16px" }}>
          {prompt.scenario}
        </p>

        {/* Guiding Questions */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Key Points to Address:
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {prompt.guidingQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Target Concept Requirements */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Mandatory C1 Target Expressions:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {prompt.mandatoryTargetConcepts.map((target, idx) => (
            <span
              key={idx}
              className="badge"
              style={{
                fontSize: "0.82rem",
                padding: "6px 12px",
                background: "rgba(6, 182, 212, 0.12)",
                color: "#67e8f9",
                border: "1px solid rgba(6, 182, 212, 0.25)",
              }}
            >
              + {target}
            </span>
          ))}
        </div>
      </div>

      {/* Voice Recorder & Speech Ingestion */}
      {!result ? (
        <div>
          <AudioVoiceRecorder
            onTranscriptReady={handleTranscriptSubmission}
            timeLimitSeconds={prompt.timeLimitSeconds}
          />
        </div>
      ) : (
        /* Spoken Evaluation Scorecard */
        <div
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.02)",
            border: `1px solid ${result.evaluation.isCorrect ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            marginBottom: "24px",
          }}
        >
          {/* Score Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {result.evaluation.isCorrect ? (
                <CheckCircle2 size={28} color="#34d399" />
              ) : (
                <AlertTriangle size={28} color="#fbbf24" />
              )}
              <div>
                <h3 style={{ fontSize: "1.25rem" }}>
                  Spoken Score: {result.evaluation.overallScorePercent}%
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {result.evaluation.fluencyMetrics.paceAssessment}
                </span>
              </div>
            </div>

            {result.submission && (
              <span className="badge badge-c1">
                FSRS: {result.submission.rating} (Due {result.submission.scheduledDays === 0 ? "Today" : `in ${result.submission.scheduledDays}d`})
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Speaking Pace</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "2px" }}>
                {result.evaluation.fluencyMetrics.wordsPerMinute} WPM
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Targets Integrated</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                {result.evaluation.targetConceptsFound.length}/{prompt.mandatoryTargetConcepts.length}
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Filler Word Count</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: result.evaluation.fluencyMetrics.fillerWordsCount > 2 ? "#fbbf24" : "#34d399", marginTop: "2px" }}>
                {result.evaluation.fluencyMetrics.fillerWordsCount} fillers
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Production Mastery</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#818cf8", marginTop: "2px" }}>
                +{result.submission ? Math.round(result.submission.newOverallMastery * 100) : 75}%
              </div>
            </div>
          </div>

          {/* Lexical Upgrade Suggestions */}
          {result.evaluation.lexicalUpgrades.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "8px" }}>
                Recommended C1 Lexical Upgrades:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.evaluation.lexicalUpgrades.map((u, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(6, 182, 212, 0.06)",
                      border: "1px solid rgba(6, 182, 212, 0.2)",
                      fontSize: "0.88rem",
                    }}
                  >
                    Replace &ldquo;<strong>{u.originalPhrase}</strong>&rdquo; ➔ <strong style={{ color: "#67e8f9" }}>{u.c1Upgrade}</strong> ({u.reason})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model C1 Response */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Model C1 Executive Response:
            </div>
            <p style={{ fontStyle: "italic", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
              &ldquo;{result.evaluation.modelAnswer}&rdquo;
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
              style={{ flex: 1, padding: "14px", gap: "8px" }}
            >
              <RotateCcw size={16} />
              <span>Record Again</span>
            </button>
            <button
              type="button"
              onClick={handleNextPrompt}
              className="btn-primary"
              style={{ flex: 1, padding: "14px", gap: "8px" }}
            >
              <span>Next Speaking Scenario</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
