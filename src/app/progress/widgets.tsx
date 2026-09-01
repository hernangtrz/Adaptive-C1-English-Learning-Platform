"use client";

import { ProgressAuditReport } from "@/modules/progress/types";
import {
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Zap,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function ModalityOverviewCards({ report }: { report: ProgressAuditReport }) {
  const iconMap: Record<string, any> = {
    LEXICAL_MASTERY: BookOpen,
    GRAMMAR_PRECISION: Zap,
    LISTENING_DECODING: Headphones,
    PRODUCTIVE_OUTPUT: Mic,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px",
        marginBottom: "32px",
      }}
    >
      {report.modalities.map((mod) => {
        const IconComponent = iconMap[mod.id] || Sparkles;
        return (
          <div key={mod.id} className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconComponent size={20} color="var(--accent-cyan)" />
              </div>
              <span className="badge badge-c1" style={{ fontSize: "0.72rem" }}>
                {mod.cefrSubBand}
              </span>
            </div>

            <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: "4px" }}>
              {mod.scorePercent}%
            </div>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>{mod.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.4, marginBottom: "16px" }}>
              {mod.description}
            </p>

            <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${mod.scorePercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--primary) 0%, var(--accent-cyan) 100%)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ConversionFunnelWidget({ report }: { report: ProgressAuditReport }) {
  const c = report.conversion;

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            Passive ➔ Active Pipeline
          </span>
          <h3 style={{ fontSize: "1.25rem", marginTop: "2px" }}>Conversion Efficiency</h3>
        </div>
        <span className="badge" style={{ fontSize: "0.85rem", color: "#34d399", background: "rgba(16, 185, 129, 0.12)" }}>
          {c.conversionRatePercent}% Resolved
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {/* Step 1: Tracked */}
        <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Step 1: Total Lexicon Tracked</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{c.totalTrackedConcepts} Expressions</div>
          </div>
          <span className="badge">100% Discovered</span>
        </div>

        {/* Step 2: Bottlenecks */}
        <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#fbbf24" }}>Step 2: Passive Bottlenecks (Gap &ge; 20%)</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#f59e0b" }}>{c.totalBottlenecksEver} Identified</div>
          </div>
          <span className="badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}>
            {c.activeBottlenecksRemaining} Active
          </span>
        </div>

        {/* Step 3: Resolved */}
        <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#34d399" }}>Step 3: Converted to Spontaneous Active</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#34d399" }}>{c.resolvedBottlenecksCount} Mastered</div>
          </div>
          <CheckCircle2 size={20} color="#34d399" />
        </div>
      </div>

      <Link href="/vocabulary?tab=passive" className="btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem" }}>
        <span>Launch Bottleneck Drill Suite</span>
        <ChevronRight size={15} />
      </Link>
    </div>
  );
}

export function RetentionDistributionWidget({ report }: { report: ProgressAuditReport }) {
  const r = report.retention;

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            FSRS Spaced Stability
          </span>
          <h3 style={{ fontSize: "1.25rem", marginTop: "2px" }}>Memory Retention Curves</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399" }}>
            ~{r.estimatedRetentionRatePercent}%
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Target Retention</div>
        </div>
      </div>

      {/* Interval Buckets Histogram */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {r.buckets.map((b) => (
          <div key={b.intervalLabel}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Interval: {b.intervalLabel}</span>
              <span style={{ fontWeight: 600 }}>{b.count} cards ({b.percentage}%)</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${b.percentage}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        <span>Average Interval: <strong>{r.averageIntervalDays} days</strong></span>
        <span>Total Memory Cards: <strong>{r.totalFSRSCards}</strong></span>
      </div>
    </div>
  );
}

export function MilestonesWidget({ report }: { report: ProgressAuditReport }) {
  const iconMap: Record<string, any> = {
    Zap: Zap,
    Flame: Flame,
    TrendingUp: TrendingUp,
    BookOpen: BookOpen,
    Headphones: Headphones,
    Mic: Mic,
    PenTool: PenTool,
    Award: Award,
  };

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            Milestones & Badges
          </span>
          <h3 style={{ fontSize: "1.25rem", marginTop: "2px" }}>C1 Competence Accomplishments</h3>
        </div>
        <span className="badge badge-c1">
          {report.milestones.filter((m) => m.isUnlocked).length}/{report.milestones.length} Unlocked
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {report.milestones.map((m) => {
          const IconComponent = iconMap[m.iconName] || Award;
          return (
            <div
              key={m.id}
              style={{
                padding: "16px",
                borderRadius: "10px",
                background: m.isUnlocked ? "rgba(99, 102, 241, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: m.isUnlocked ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid var(--border-subtle)",
                opacity: m.isUnlocked ? 1 : 0.6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: m.isUnlocked ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconComponent size={16} color={m.isUnlocked ? "var(--accent-cyan)" : "var(--text-muted)"} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: m.isUnlocked ? "#ffffff" : "var(--text-secondary)" }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: m.isUnlocked ? "#34d399" : "var(--text-muted)" }}>
                    {m.isUnlocked ? "Unlocked ✓" : `${m.progressPercent}% progress`}
                  </div>
                </div>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.4, margin: 0 }}>
                {m.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DiagnosticAuditWidget({ report }: { report: ProgressAuditReport }) {
  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <ShieldCheck size={20} color="var(--accent-cyan)" />
        <h3 style={{ fontSize: "1.25rem" }}>C1 Readiness Diagnostic Audit</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Strengths */}
        <div style={{ padding: "18px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34d399", textTransform: "uppercase", marginBottom: "10px" }}>
            Key Strengths:
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div style={{ padding: "18px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.04)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "10px" }}>
            Recommended Next Steps:
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
            {report.recommendedActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
