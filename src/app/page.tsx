import Link from "next/link";
import { getCurrentUser } from "@/modules/auth/session";
import {
  Sparkles,
  Flame,
  Zap,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  TrendingUp,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Brain,
  Layers,
  Cpu,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();

  const tracks = [
    {
      title: "Today's Daily Workout",
      href: "/training",
      desc: "A personalized 15-45 minute guided daily curriculum combining FSRS reviews, passive bottleneck drills, and output tasks.",
      icon: Sparkles,
      color: "#fbbf24",
      tag: "Core Habit",
    },
    {
      title: "Learner Cockpit & Analytics",
      href: "/dashboard",
      desc: "Instant visibility into your C1 Readiness Index (0-100), 3D mastery breakdown, and passive vocabulary bottlenecks.",
      icon: LayoutDashboard,
      color: "var(--accent-cyan)",
      tag: "Intelligence",
    },
    {
      title: "Spaced Retrieval Queue",
      href: "/review",
      desc: "Free Spaced Repetition Scheduler (FSRS) with difficulty & memory stability scheduling targeting 90%+ retention.",
      icon: Zap,
      color: "#818cf8",
      tag: "Memory Engine",
    },
    {
      title: "Vocabulary & Collocations",
      href: "/vocabulary",
      desc: "25+ curated C1 expressions with passive bottleneck filters, 4-stage exercise suites, and contextual cloze drills.",
      icon: BookOpen,
      color: "#34d399",
      tag: "Lexicon",
    },
    {
      title: "Grammar & Inversions",
      href: "/grammar",
      desc: "Negative inversions, mixed conditionals, cleft sentences, mandative subjunctives, and participle clauses.",
      icon: Layers,
      color: "#a78bfa",
      tag: "Syntax",
    },
    {
      title: "Listening & Connected Speech",
      href: "/listening",
      desc: "Acoustic micro-dictation, weak forms decoding, assimilation reduction training, and executive comprehension.",
      icon: Headphones,
      color: "#38bdf8",
      tag: "Acoustic Lab",
    },
    {
      title: "Spoken Fluency Studio",
      href: "/speaking",
      desc: "Live microphone recording, real-time speech recognition, WPM pacing analysis, and lexical upgrade feedback.",
      icon: Mic,
      color: "#fb7185",
      tag: "Active Spoken",
    },
    {
      title: "Writing & Register Studio",
      href: "/writing",
      desc: "Executive memorandums, business proposals, post-mortems, discourse cohesion markers, and formal register auditing.",
      icon: PenTool,
      color: "#34d399",
      tag: "Written Discourse",
    },
    {
      title: "Macro CEFR Progress Tracker",
      href: "/progress",
      desc: "4-modality competence radar, passive-to-active conversion funnel, FSRS retention histograms, and milestone badges.",
      icon: TrendingUp,
      color: "#f59e0b",
      tag: "Milestones",
    },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "48px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "64px", paddingTop: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--accent-cyan)",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "20px",
              border: "1px solid rgba(99, 102, 241, 0.25)",
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>ADAPTIVE C1 ENGLISH MASTERY PLATFORM</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              lineHeight: 1.15,
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bridge the Gap from B2 Knowledge <br />
            to Spontaneous C1 Fluency
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.15rem",
              maxWidth: "760px",
              margin: "0 auto 36px auto",
              lineHeight: 1.6,
            }}
          >
            Transform passive English knowledge into active, retrievable, and executive-level fluency.
            Powered by modern Free Spaced Repetition (FSRS), 3D mastery weighting (20/30/50),
            connected speech decoding, and live speech-to-text fluency simulations.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
            {user ? (
              <>
                <Link href="/training" className="btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
                  <Sparkles size={18} />
                  <span>Launch Today's Workout</span>
                </Link>
                <Link href="/dashboard" className="btn-secondary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
                  <LayoutDashboard size={18} />
                  <span>Open Learner Cockpit</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register" className="btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/auth/login" className="btn-secondary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 3D Mastery Competence Formula Highlight */}
        <div
          className="glass-card"
          style={{
            padding: "36px 32px",
            marginBottom: "64px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Scientific Competence Model
            </span>
            <h2 style={{ fontSize: "1.8rem", marginTop: "4px" }}>The 3-Dimensional Mastery Architecture</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: "620px", margin: "8px auto 0 auto" }}>
              Traditional apps stop at multiple-choice recognition. Our platform weights active production at 50% to systematically eradicate passive bottlenecks.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", color: "#818cf8", fontWeight: 700 }}>DIMENSION 1 (20% Weight)</div>
              <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Recognition Mastery</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Identifying nuance, definition precision, and contextual meaning when encountering C1 forms in input.
              </p>
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", color: "#38bdf8", fontWeight: 700 }}>DIMENSION 2 (30% Weight)</div>
              <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Cued Retrieval Mastery</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Recalling the target collocation or grammar pattern when prompted by scenario or Spanish cue without options.
              </p>
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <div style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: 700 }}>DIMENSION 3 (50% Weight)</div>
              <h3 style={{ fontSize: "1.2rem", margin: "6px 0" }}>Spontaneous Production</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                Deploying target C1 structures spontaneously in live speech recordings, debates, and executive writing.
              </p>
            </div>
          </div>
        </div>

        {/* Modules & Tracks Grid */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ marginBottom: "28px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Comprehensive Curriculum
            </span>
            <h2 style={{ fontSize: "2rem", marginTop: "4px" }}>The C1 Training Suite</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {tracks.map((t, idx) => {
              const IconComp = t.icon;
              return (
                <Link
                  key={idx}
                  href={t.href}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComp size={20} color={t.color} />
                      </div>
                      <span className="badge" style={{ fontSize: "0.72rem" }}>
                        {t.tag}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{t.title}</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5, marginBottom: "16px" }}>
                      {t.desc}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    <span>Launch Module</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Summary */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "32px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          <div>
            <strong>Adaptive C1 English Platform</strong> • Precision Spaced Retrieval & Production Mastery
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/concepts" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Concepts Library</Link>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/progress" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Progress Analytics</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
