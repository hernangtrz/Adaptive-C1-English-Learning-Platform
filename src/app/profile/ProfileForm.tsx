"use client";

import { useState } from "react";
import { updateUserProfileAction } from "@/modules/users/actions";
import { Save, CheckCircle, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  profile: {
    currentCEFRLevel: string;
    targetCEFRLevel: string;
    dailyMinutes: number;
    timezone: string;
    nativeLanguage: string;
  };
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [currentLevel, setCurrentLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">(
    (profile.currentCEFRLevel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2") || "B2"
  );
  const [targetLevel, setTargetLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">(
    (profile.targetCEFRLevel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2") || "C1"
  );
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyMinutes || 30);
  const [timezone, setTimezone] = useState(profile.timezone || "UTC");
  const [nativeLanguage, setNativeLanguage] = useState(profile.nativeLanguage || "es");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await updateUserProfileAction({
        currentCEFRLevel: currentLevel,
        targetCEFRLevel: targetLevel,
        dailyMinutes: Number(dailyMinutes),
        timezone,
        nativeLanguage,
      });

      if (!res.success) {
        setError(res.message || "Failed to update profile.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="glass-card" style={{ padding: "28px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Edit Training Preferences</h3>

      {success && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#6ee7b7",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <CheckCircle size={18} />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fca5a5",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Current Level
          </label>
          <select
            value={currentLevel}
            onChange={(e) => setCurrentLevel(e.target.value as "A1" | "A2" | "B1" | "B2" | "C1" | "C2")}
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
            <option value="B1">B1 (Intermediate)</option>
            <option value="B2">B2 (Upper Intermediate)</option>
            <option value="C1">C1 (Advanced)</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Target Level
          </label>
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value as "A1" | "A2" | "B1" | "B2" | "C1" | "C2")}
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
            <option value="C1">C1 (Active Fluency)</option>
            <option value="C2">C2 (Near-Native)</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Daily Training Target (Minutes)
          </label>
          <input
            type="number"
            min={10}
            max={180}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
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
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
            Timezone
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
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        <Save size={16} />
        <span>{loading ? "Saving changes..." : "Save Preferences"}</span>
      </button>
    </form>
  );
}
