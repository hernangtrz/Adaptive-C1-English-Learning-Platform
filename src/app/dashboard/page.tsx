import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { DashboardService } from "@/modules/dashboard/dashboard.service";
import {
  QuickActionBanner,
  C1ReadinessWidget,
  MasteryBreakdownWidget,
  ProductionGapWidget,
  WeeklyActivityWidget,
} from "./widgets";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  const data = await DashboardService.getDashboardData(user.id);

  if (!data) {
    redirect("/onboarding");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top Quick-Action Hero */}
        <QuickActionBanner data={data} />

        {/* Core Analytics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* C1 Readiness Index Gauge */}
          <C1ReadinessWidget data={data} />

          {/* 3D Mastery Model (20/30/50) */}
          <MasteryBreakdownWidget data={data} />
        </div>

        {/* Secondary Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Passive Vocabulary Bottlenecks */}
          <ProductionGapWidget data={data} />

          {/* 7-Day Activity & Streak Momentum */}
          <WeeklyActivityWidget data={data} />
        </div>
      </div>
    </div>
  );
}
