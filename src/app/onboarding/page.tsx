"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfileAction } from "@/modules/users/actions";
import { Sparkles, Clock, Globe, ArrowRight, Compass, CheckCircle } from "lucide-react";

const CEFR_DESCRIPTIONS: Record<string, string> = {
  B1: "Intermediate — Can understand the main points of clear standard input on familiar matters.",
  B2: "Upper Intermediate — Can understand complex ideas, but active production & nuance need work.",
  C1: "Advanced / Fluent — Target level! Spontaneous, flexible, active expression across all domains.",
  C2: "Mastery / Native-like — Effortless precision, natural idioms, and subtle nuance.",
};

export default function OnboardingPage() {
  const router = useRouter();

  const [currentLevel, setCurrentLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">("B2");
  const [targetLevel, setTargetLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">("C1");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [timezone, setTimezone] = useState("UTC");
  const [nativeLanguage, setNativeLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-detect browser timezone
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) setTimezone(userTz);
    } catch {
      // fallback to UTC
    }
  }, []);

  async function handleComplete() {
    setError(null);
    setLoading(true);

    try {
      const res = await updateUserProfileAction({
        currentCEFRLevel: currentLevel,
        targetCEFRLevel: targetLevel,
        dailyMinutes,
        timezone,
        nativeLanguage,
        onboarded: true,
      });

      if (!res.success) {
        setError(res.message || "Failed to save profile.");
        setLoading(false);
        return;
      }

      router.push("/profile?setup=complete");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "48px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "760px",
          width: "100%",
          padding: "44px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            <Sparkles size={14} />
            Step 1 of 1 — Personalize Your Training
          </div>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Configure Your Learning Journey</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            The adaptive engine tailors daily retrieval sessions, production exercises, and listening content
            to your specific starting point and time availability.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fca5a5",
              fontSize: "0.88rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Section 1: Current CEFR Level */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "14px",
            }}
          >
            <Compass size={18} color="#818cf8" />
            Where are you currently? (Current CEFR Level)
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {(["B1", "B2", "C1"] as const).map((lvl) => {
              const isSelected = currentLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCurrentLevel(lvl)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    {lvl}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {lvl === "B1" ? "Intermediate" : lvl === "B2" ? "Upper Intermediate" : "Advanced"}
                  </div>
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            {CEFR_DESCRIPTIONS[currentLevel]}
          </div>
        </div>

        {/* Section 2: Target Level */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "14px",
            }}
          >
            <CheckCircle size={18} color="#06b6d4" />
            What is your target? (Target CEFR Level)
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {(["C1", "C2"] as const).map((lvl) => {
              const isSelected = targetLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setTargetLevel(lvl)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    border: isSelected ? "2px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    {lvl}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    {lvl === "C1" ? "Active Fluency (Recommended)" : "Near-Native Mastery"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Daily Practice Time */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              <Clock size={18} color="#f59e0b" />
              Daily Study Time Commitment
            </label>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "var(--accent-amber)",
              }}
            >
              {dailyMinutes} min / day
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "10px",
            }}
          >
            {[15, 30, 45, 60, 90, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyMinutes(mins)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  background: dailyMinutes === mins ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.03)",
                  border: dailyMinutes === mins ? "2px solid var(--accent-amber)" : "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Timezone & Language */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              <Globe size={16} />
              Timezone (For Daily Reset)
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              Native Language
            </label>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#1e293b",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
              }}
            >
              <option value="es">Spanish (Español)</option>
              <option value="pt">Portuguese (Português)</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
              <option value="it">Italian (Italiano)</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleComplete}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "16px", fontSize: "1rem" }}
        >
          {loading ? (
            "Saving profile..."
          ) : (
            <>
              <span>Save & Launch My C1 Journey</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
