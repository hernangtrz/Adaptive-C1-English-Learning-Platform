import {
  Layers,
  Database,
  Brain,
  Sparkles,
  Zap,
  CheckCircle2,
  GitBranch,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  const modules = [
    {
      title: "Core Architecture",
      status: "Configured",
      desc: "Modular monolith structure with strict domain boundaries under src/modules and src/services.",
      icon: <Layers size={20} color="#818cf8" />,
    },
    {
      title: "Database Layer",
      status: "Configured (PostgreSQL)",
      desc: "Prisma ORM setup targeting Supabase / PostgreSQL with connection pool and direct URL support.",
      icon: <Database size={20} color="#34d399" />,
    },
    {
      title: "Spaced Repetition (FSRS)",
      status: "Dependency Ready",
      desc: "ts-fsrs integration ready for Phase 3 memory stability & difficulty scheduling.",
      icon: <Cpu size={20} color="#06b6d4" />,
    },
    {
      title: "Mastery & Evidence Engine",
      status: "Constants Configured",
      desc: "Recognition (0.20), Recall (0.30), Production (0.50) weighted formula foundation.",
      icon: <Brain size={20} color="#f59e0b" />,
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "960px", width: "100%", margin: "0 auto" }}>
        {/* Header Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <span className="badge badge-c1">
            <Sparkles size={14} />
            Phase 0 Initialized — Architecture & Foundation
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Adaptive C1 English Learning Platform
        </h1>

        {/* Subtitle */}
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            maxWidth: "680px",
            margin: "0 auto 40px auto",
            lineHeight: 1.6,
          }}
        >
          Transforming passive English knowledge into active, retrievable, and usable fluency through
          retrieval practice, production gap targeting, and spaced repetition.
        </p>

        {/* System Status Banner */}
        <div
          className="glass-card"
          style={{
            padding: "24px",
            marginBottom: "36px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            borderLeft: "4px solid var(--primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={22} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>Phase 0 Ready</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Next.js App Router • TypeScript • Prisma • Supabase PostgreSQL • Vitest
              </div>
            </div>
          </div>
          <a href="/api/health" className="btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
            <CheckCircle2 size={16} color="#34d399" />
            Check Health API
          </a>
        </div>

        {/* Architectural Pillars Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {modules.map((m, idx) => (
            <div key={idx} className="glass-card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.icon}
                </div>
                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                  {m.status}
                </span>
              </div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{m.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Phase RoadMap Overview */}
        <div
          className="glass-card"
          style={{
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <GitBranch size={18} color="#06b6d4" />
            <h4 style={{ fontSize: "1rem" }}>Next Up: Phase 1 — Authentication + User Profile</h4>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
            User registration/login, user profile entity, current CEFR level, target CEFR level,
            daily study time budgeting, and timezone configuration.
          </p>
        </div>
      </div>
    </main>
  );
}
