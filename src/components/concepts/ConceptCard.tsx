"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, Plus, Check, BookOpen, Volume2 } from "lucide-react";
import { trackConceptAction } from "@/modules/concepts/actions";

interface ConceptCardProps {
  concept: {
    id: string;
    type: string;
    canonicalForm: string;
    meaning: string;
    translationEs: string;
    cefrLevel: string;
    explanation?: string | null;
    phonetics?: string | null;
    tags: string[];
    examples: unknown;
  };
  isTracked?: boolean;
}

export default function ConceptCard({ concept, isTracked = false }: ConceptCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [tracked, setTracked] = useState(isTracked);
  const [loading, setLoading] = useState(false);

  const examples = Array.isArray(concept.examples)
    ? (concept.examples as Array<{ sentence: string; translationEs: string; context?: string }>)
    : [];

  async function handleTrack() {
    if (tracked || loading) return;
    setLoading(true);
    try {
      const res = await trackConceptAction(concept.id);
      if (res.success) {
        setTracked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  const typeLabels: Record<string, string> = {
    PHRASAL_VERB: "Phrasal Verb",
    COLLOCATION: "Collocation",
    VOCABULARY: "Vocabulary",
    FUNCTIONAL_EXPRESSION: "Expression",
    GRAMMAR: "Grammar Pattern",
    SENTENCE_PATTERN: "Sentence Pattern",
    PRONUNCIATION: "Pronunciation",
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "16px",
        position: "relative",
      }}
    >
      <div>
        {/* Header Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--accent-cyan)",
              background: "rgba(6, 182, 212, 0.1)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {typeLabels[concept.type] || concept.type}
          </span>

          <span
            className={concept.cefrLevel === "C1" ? "badge badge-c1" : "badge"}
            style={{
              background: concept.cefrLevel === "C1" ? "rgba(99, 102, 241, 0.2)" : "rgba(245, 158, 11, 0.15)",
              color: concept.cefrLevel === "C1" ? "#818cf8" : "#fbbf24",
              border: `1px solid ${concept.cefrLevel === "C1" ? "rgba(99, 102, 241, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            }}
          >
            {concept.cefrLevel}
          </span>
        </div>

        {/* Canonical Form & Phonetics */}
        <div style={{ marginBottom: "8px" }}>
          <Link
            href={`/concepts/${concept.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h3
              style={{
                fontSize: "1.3rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--text-primary)",
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            >
              {concept.canonicalForm}
            </h3>
          </Link>
          {concept.phonetics && (
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
              {concept.phonetics}
            </div>
          )}
        </div>

        {/* Meaning */}
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "14px" }}>
          {concept.meaning}
        </p>

        {/* Spanish Translation Reveal Toggle */}
        <div style={{ marginBottom: "14px" }}>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--accent-cyan)",
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: 0,
            }}
          >
            {showTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showTranslation ? "Hide Spanish Translation" : "Show Spanish Translation"}</span>
          </button>
          {showTranslation && (
            <div
              style={{
                marginTop: "6px",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                color: "#67e8f9",
                fontSize: "0.85rem",
              }}
            >
              {concept.translationEs}
            </div>
          )}
        </div>

        {/* Example Sentence */}
        {examples.length > 0 && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
              Context: {examples[0].context || "Authentic Example"}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontStyle: "italic", lineHeight: 1.4 }}>
              &ldquo;{examples[0].sentence}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Footer Tags & Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {concept.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                background: "rgba(255, 255, 255, 0.04)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleTrack}
          disabled={tracked || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: tracked ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
            border: `1px solid ${tracked ? "rgba(16, 185, 129, 0.3)" : "rgba(99, 102, 241, 0.3)"}`,
            color: tracked ? "#34d399" : "#818cf8",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: tracked ? "default" : "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          {tracked ? (
            <>
              <Check size={14} />
              <span>In Queue</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>{loading ? "Adding..." : "Add to Queue"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
