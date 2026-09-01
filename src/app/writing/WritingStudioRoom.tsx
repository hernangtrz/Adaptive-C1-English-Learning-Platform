"use client";

import { useState } from "react";
import { WritingPrompt, WritingEvaluationResult } from "@/modules/writing/types";
import { submitWritingAttemptAction } from "@/modules/writing/actions";
import { ReviewSubmissionResult } from "@/modules/reviews/types";
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Zap,
  BookOpen,
  Layers,
  FileText,
  Check,
} from "lucide-react";

interface WritingStudioRoomProps {
  prompts: WritingPrompt[];
}

export default function WritingStudioRoom({ prompts }: WritingStudioRoomProps) {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    evaluation: WritingEvaluationResult;
    submission?: ReviewSubmissionResult;
  } | null>(null);

  const prompt = prompts[selectedPromptIndex];
  if (!prompt) return null;

  const currentWords = text.trim().split(/\s+/).filter(Boolean).length;
  const isWordCountMet = currentWords >= prompt.minWords;

  // Live detection of target concepts in textarea
  const normalizedText = text.toLowerCase();
  const liveFoundTargets = prompt.mandatoryTargetConcepts.filter((target) => {
    const base = target.toLowerCase().split(" ")[0].replace(/(s|ed|ing)$/i, "");
    return normalizedText.includes(target.toLowerCase()) || normalizedText.includes(base);
  });

  async function handleSubmit() {
    if (loading || !text.trim()) return;
    setLoading(true);

    try {
      const res = await submitWritingAttemptAction({
        promptId: prompt.id,
        text,
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
    setText("");
    setSelectedPromptIndex((prev) => (prev + 1) % prompts.length);
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div className="glass-card" style={{ padding: "36px 32px" }}>
      {/* Studio Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            {prompt.category.replace(/_/g, " ")} — Exercise {selectedPromptIndex + 1} of {prompts.length}
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
                setText("");
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

      {/* Scenario Briefing */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "12px",
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontWeight: 700, textTransform: "uppercase" }}>
            Target Audience: {prompt.targetAudience}
          </span>
          <span className="badge badge-c1">{prompt.genre}</span>
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: "16px" }}>
          {prompt.scenario}
        </p>

        {/* Guidelines */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Structural Guidelines:
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {prompt.guidelines.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Target Requirements & Live Checklist */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Mandatory Target Concepts:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {prompt.mandatoryTargetConcepts.map((target, idx) => {
              const isFound = liveFoundTargets.includes(target);
              return (
                <span
                  key={idx}
                  className="badge"
                  style={{
                    fontSize: "0.82rem",
                    padding: "4px 10px",
                    background: isFound ? "rgba(16, 185, 129, 0.15)" : "rgba(6, 182, 212, 0.12)",
                    color: isFound ? "#34d399" : "#67e8f9",
                    border: `1px solid ${isFound ? "rgba(16, 185, 129, 0.3)" : "rgba(6, 182, 212, 0.25)"}`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {isFound ? <Check size={12} /> : "+"} {target}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Recommended Connectors:
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontStyle: "italic" }}>
            {prompt.recommendedConnectors.join(" • ")}
          </div>
        </div>
      </div>

      {/* Writing Studio Editor */}
      {!result ? (
        <div>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Draft your formal C1 composition here. Incorporate the mandatory target expressions and discourse connectors..."
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px",
                fontSize: "0.82rem",
                color: isWordCountMet ? "#34d399" : "var(--text-muted)",
              }}
            >
              <span>
                Word count: <strong>{currentWords}</strong> / {prompt.minWords}-{prompt.maxWords} words
              </span>
              <span>
                Targets incorporated: <strong>{liveFoundTargets.length}</strong> / {prompt.mandatoryTargetConcepts.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || currentWords < 15}
            className="btn-primary"
            style={{ width: "100%", padding: "14px" }}
          >
            <span>Analyze Composition & Save Production Mastery</span>
            <Sparkles size={16} />
          </button>
        </div>
      ) : (
        /* Evaluation Scorecard */
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
                  Writing Score: {result.evaluation.overallScorePercent}%
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {result.evaluation.cohesionMetrics.cohesionRating}
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
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Words</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "2px" }}>
                {result.evaluation.cohesionMetrics.totalWords} words
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Target Concepts</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                {result.evaluation.targetConceptsFound.length}/{prompt.mandatoryTargetConcepts.length}
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Discourse Connectors</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#818cf8", marginTop: "2px" }}>
                {result.evaluation.cohesionMetrics.discourseMarkerCount} found
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Production Mastery</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                +{result.submission ? Math.round(result.submission.newOverallMastery * 100) : 80}%
              </div>
            </div>
          </div>

          {/* Register Upgrades */}
          {result.evaluation.registerUpgrades.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "8px" }}>
                Stylistic Register Upgrades:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.evaluation.registerUpgrades.map((u, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.06)",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      fontSize: "0.88rem",
                    }}
                  >
                    Replace &ldquo;<strong>{u.informalPhrase}</strong>&rdquo; ➔ <strong style={{ color: "#fbbf24" }}>{u.suggestedUpgrade}</strong> ({u.explanation})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model C1 Response */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Model C1 Executive Composition:
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
              <span>Edit Composition</span>
            </button>
            <button
              type="button"
              onClick={handleNextPrompt}
              className="btn-primary"
              style={{ flex: 1, padding: "14px", gap: "8px" }}
            >
              <span>Next Writing Scenario</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
