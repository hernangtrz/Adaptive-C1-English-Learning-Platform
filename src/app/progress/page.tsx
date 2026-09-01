import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { ProgressService } from "@/modules/progress/progress.service";
import {
  ModalityOverviewCards,
  ConversionFunnelWidget,
  RetentionDistributionWidget,
  MilestonesWidget,
  DiagnosticAuditWidget,
} from "./widgets";
import { TrendingUp, Sparkles, Award } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/progress");
  }

  const report = await ProgressService.getProgressReport(user.id);

  if (!report) {
    redirect("/onboarding");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Hero */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", marginBottom: "32px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "rgba(99, 102, 241, 0.12)",
                color: "var(--accent-cyan)",
                fontSize: "0.75rem",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              <TrendingUp size={14} />
              MACRO CEFR COMPETENCE & VELOCITY TRACKING
            </div>
            <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Competence & Progress Analytics</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
              Comprehensive multi-modality evaluation tracking your progression from B2 operational fluency to native-like C1 command.
            </p>
          </div>

          {/* C1 Score Indicator */}
          <div
            className="glass-card"
            style={{
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Readiness Score</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-display)" }}>
                {report.overallC1ReadinessScore} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ 100</span>
              </div>
            </div>
            <span className="badge badge-c1">{report.readinessBand}</span>
          </div>
        </div>

        {/* 1. Multi-Modality Competence Cards */}
        <ModalityOverviewCards report={report} />

        {/* 2. Secondary Analytics Grid: Funnel + Retention */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <ConversionFunnelWidget report={report} />
          <RetentionDistributionWidget report={report} />
        </div>

        {/* 3. Milestone Badges */}
        <div style={{ marginBottom: "32px" }}>
          <MilestonesWidget report={report} />
        </div>

        {/* 4. Diagnostic Audit */}
        <DiagnosticAuditWidget report={report} />
      </div>
    </div>
  );
}
