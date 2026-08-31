import Link from "next/link";
import { SpeakingService } from "@/modules/speaking/speaking.service";
import { SpeakingPromptCategory } from "@/modules/speaking/types";
import SpeakingSimulationRoom from "./SpeakingSimulationRoom";
import {
  Mic,
  Sparkles,
  Zap,
  Award,
  Layers,
  Flame,
  Volume2,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function SpeakingPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  const activeCategory = category as SpeakingPromptCategory | undefined;
  const prompts = SpeakingService.getSpeakingPrompts(activeCategory);

  const categories: Array<{
    id: SpeakingPromptCategory;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      id: "EXECUTIVE_DECISION",
      title: "Executive Strategic Decisions",
      description: "Articulate high-stakes engineering trade-offs, scope adjustments, and deadline postponements.",
      badge: "Leadership",
    },
    {
      id: "DEBATE_DISAGREEMENT",
      title: "Nuanced Debate & Disagreement",
      description: "Formulate diplomatic, structured counter-arguments and concessions in forums.",
      badge: "Diplomacy",
    },
    {
      id: "STRATEGIC_PITCH",
      title: "C1 Executive Elevator Pitches",
      description: "Deliver persuasive, concise proposals to senior stakeholders and investors.",
      badge: "Persuasion",
    },
    {
      id: "PROBLEM_SOLVING_NARRATIVE",
      title: "Problem-Solving Post-Mortems",
      description: "Narrate technical triage and architectural solutions under crisis conditions.",
      badge: "Incident Command",
    },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(244, 63, 94, 0.12)",
              color: "#fb7185",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Mic size={14} />
            ACTIVE SPOKEN PRODUCTION & DISCOURSE SIMULATION
          </div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Speaking & Spoken Fluency</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
            Convert passive vocabulary into spontaneous verbal fluency. Practice realistic C1 workplace scenarios,
            monitor words per minute (WPM), eliminate filler words, and receive real-time lexical upgrades.
          </p>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="glass-card"
                style={{
                  padding: "22px",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(99, 102, 241, 0.08)" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="badge badge-c1" style={{ fontSize: "0.7rem" }}>
                      {cat.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>{cat.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.4, marginBottom: "14px" }}>
                    {cat.description}
                  </p>
                </div>

                <Link
                  href={`/speaking?category=${cat.id}`}
                  className={isSelected ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", fontSize: "0.8rem", padding: "6px 12px", justifyContent: "center" }}
                >
                  {isSelected ? "Active Scenario" : "Select Track"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Filter Navigation */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Link
              href="/speaking"
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                background: !activeCategory ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                color: !activeCategory ? "#ffffff" : "var(--text-secondary)",
                border: !activeCategory ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
              }}
            >
              All Scenarios ({SpeakingService.getSpeakingPrompts().length})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/speaking?category=${c.id}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: activeCategory === c.id ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                  color: activeCategory === c.id ? "#ffffff" : "var(--text-secondary)",
                  border: activeCategory === c.id ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                }}
              >
                {c.title.split(" ")[0]}
              </Link>
            ))}
          </div>

          <Link href="/review" className="btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
            <Zap size={14} />
            <span>Spaced Review Queue</span>
          </Link>
        </div>

        {/* Interactive Simulation Room */}
        <SpeakingSimulationRoom prompts={prompts} />
      </div>
    </div>
  );
}
