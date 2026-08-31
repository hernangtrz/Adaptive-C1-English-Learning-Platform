"use client";

import Link from "next/link";
import { DashboardData } from "@/modules/dashboard/types";
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Brain,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";

export function QuickActionBanner({ data }: { data: DashboardData }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "28px 32px",
        marginBottom: "32px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="badge badge-c1">
              <Flame size={12} color="#f59e0b" />
              {data.streak.currentStreak} Day Streak
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {data.dueCount} Memory Card{data.dueCount === 1 ? "" : "s"} Due
            </span>
          </div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "4px" }}>
            Welcome back, {data.user.name || "C1 Scholar"}!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            {data.dueCount > 0
              ? `You have ${data.dueCount} cards scheduled for spaced retrieval today.`
              : "Your memory queue is clean! Ready to advance passive bottlenecks or acquire new C1 expressions?"}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link href="/training" className="btn-primary" style={{ padding: "12px 22px" }}>
            <Sparkles size={16} />
            <span>Launch Today's Training</span>
          </Link>
          {data.dueCount > 0 && (
            <Link href="/review" className="btn-secondary" style={{ padding: "12px 20px" }}>
              <Zap size={16} />
              <span>Review Due ({data.dueCount})</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function C1ReadinessWidget({ data }: { data: DashboardData }) {
  const score = data.c1ReadinessScore;

  return (
    <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
            C1 Readiness Index
          </span>
          <span className="badge badge-c1">{data.readinessBand}</span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#ffffff" }}>
            {score}
          </span>
          <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
        </div>

        <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "rgba(255, 255, 255, 0.06)", overflow: "hidden", marginBottom: "16px" }}>
          <div
            style={{
              width: `${score}%`,
              height: "100%",
              background: "linear-gradient(90deg, #818cf8 0%, #06b6d4 50%, #34d399 100%)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5 }}>
          Calculated from active production fluency (40%), concept mastery volume (30%), and recall accuracy (20%).
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        <span>Current: <strong>{data.user.profile?.currentCEFRLevel || "B2"}</strong></span>
        <span>Target: <strong>{data.user.profile?.targetCEFRLevel || "C1"}</strong></span>
      </div>
    </div>
  );
}

export function MasteryBreakdownWidget({ data }: { data: DashboardData }) {
  const m = data.mastery;

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
          3D Competence Model
        </span>
        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {m.totalItems} Tracked Expressions
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Recognition */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Recognition Mastery (Weight: 20%)</span>
            <strong style={{ color: "#818cf8" }}>{Math.round(m.averageRecognition * 100)}%</strong>
          </div>
          <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${m.averageRecognition * 100}%`, height: "100%", background: "#818cf8" }} />
          </div>
        </div>

        {/* Recall */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Recall Mastery (Weight: 30%)</span>
            <strong style={{ color: "#38bdf8" }}>{Math.round(m.averageRecall * 100)}%</strong>
          </div>
          <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${m.averageRecall * 100}%`, height: "100%", background: "#38bdf8" }} />
          </div>
        </div>

        {/* Production */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Production Mastery (Weight: 50%)</span>
            <strong style={{ color: "#34d399" }}>{Math.round(m.averageProduction * 100)}%</strong>
          </div>
          <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${m.averageProduction * 100}%`, height: "100%", background: "#34d399" }} />
          </div>
        </div>
      </div>

      {/* State Badge Distribution */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Learning</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginTop: "2px" }}>{m.byState.LEARNING}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Active</div>
          <div style={{ fontWeight: 700, color: "var(--accent-cyan)", fontSize: "1rem", marginTop: "2px" }}>{m.byState.ACTIVE}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mastered</div>
          <div style={{ fontWeight: 700, color: "#34d399", fontSize: "1rem", marginTop: "2px" }}>{m.byState.MASTERED}</div>
        </div>
      </div>
    </div>
  );
}

export function ProductionGapWidget({ data }: { data: DashboardData }) {
  const bottlenecks = data.highGapBottlenecks;

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-amber)" }}>
            <AlertTriangle size={15} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
              Passive Vocabulary Bottlenecks
            </span>
          </div>
          <h3 style={{ fontSize: "1.2rem", marginTop: "2px" }}>High Production Gap ({data.mastery.highProductionGapCount})</h3>
        </div>

        <Link href="/vocabulary?tab=passive" style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", textDecoration: "none" }}>
          View All
        </Link>
      </div>

      {bottlenecks.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <CheckCircle2 size={32} color="#34d399" style={{ margin: "0 auto 8px auto" }} />
          No passive bottlenecks! Your recall and production mastery are harmoniously balanced.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {bottlenecks.map((item) => (
            <Link
              key={item.id}
              href={`/concepts/${item.conceptId}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                textDecoration: "none",
                color: "inherit",
                transition: "all var(--transition-fast)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.canonicalForm}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Recall: {Math.round(item.recallMastery * 100)}% • Prod: {Math.round(item.productionMastery * 100)}%
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#fbbf24",
                    background: "rgba(245, 158, 11, 0.12)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  +{Math.round(item.productionGap * 100)}% Gap
                </span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function WeeklyActivityWidget({ data }: { data: DashboardData }) {
  const days = data.weeklyActivity;
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="glass-card" style={{ padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
          7-Day Practice Momentum
        </span>
        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {data.streak.totalReviewsAllTime} Total Reviews
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "140px", gap: "8px", paddingBottom: "8px" }}>
        {days.map((day) => {
          const heightPercent = Math.max(12, (day.count / maxCount) * 100);
          const hasActivity = day.count > 0;
          return (
            <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{day.count}</div>
              <div
                style={{
                  width: "100%",
                  height: `${heightPercent}%`,
                  borderRadius: "6px",
                  background: hasActivity
                    ? "linear-gradient(180deg, var(--primary) 0%, var(--accent-cyan) 100%)"
                    : "rgba(255, 255, 255, 0.04)",
                  transition: "height 0.3s ease",
                }}
              />
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: hasActivity ? "#ffffff" : "var(--text-muted)" }}>
                {day.dayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
