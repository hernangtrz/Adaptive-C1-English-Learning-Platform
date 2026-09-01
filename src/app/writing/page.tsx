import Link from "next/link";
import { WritingService } from "@/modules/writing/writing.service";
import { WritingPromptCategory } from "@/modules/writing/types";
import WritingStudioRoom from "./WritingStudioRoom";
import {
  PenTool,
  Sparkles,
  Zap,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function WritingPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  const activeCategory = category as WritingPromptCategory | undefined;
  const prompts = WritingService.getWritingPrompts(activeCategory);

  const categories: Array<{
    id: WritingPromptCategory;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      id: "EXECUTIVE_MEMO",
      title: "Executive Memorandums",
      description: "Draft high-stakes strategic briefs on architecture, risk governance, and engineering roadmap trade-offs.",
      badge: "Governance",
    },
    {
      id: "PERSUASIVE_PROPOSAL",
      title: "Persuasive Proposals",
      description: "Formulate data-backed business justifications for major infrastructure modernization budgets.",
      badge: "Business Case",
    },
    {
      id: "TECHNICAL_POST_MORTEM",
      title: "Technical Incident Post-Mortems",
      description: "Compose transparent root-cause investigations, remediation steps, and architectural safeguards.",
      badge: "Reliability",
    },
    {
      id: "ARGUMENTATIVE_ESSAY",
      title: "Argumentative Position Essays",
      description: "Synthesize critical perspectives, develop rigorous thesis statements, and resolve technical debates.",
      badge: "Critical Analysis",
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
              background: "rgba(16, 185, 129, 0.12)",
              color: "#34d399",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <PenTool size={14} />
            ACTIVE WRITTEN PRODUCTION & REGISTER STUDIO
          </div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Writing Studio & Register Refinement</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
            Master C1 written discourse for high-stakes executive environments. Practice formal memorandums,
            persuasive proposals, and post-mortems while auditing paragraph cohesion and stylistic register purity.
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
                  href={`/writing?category=${cat.id}`}
                  className={isSelected ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", fontSize: "0.8rem", padding: "6px 12px", justifyContent: "center" }}
                >
                  {isSelected ? "Active Genre" : "Select Genre"}
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
              href="/writing"
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
              All Genres ({WritingService.getWritingPrompts().length})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/writing?category=${c.id}`}
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

        {/* Interactive Writing Studio Room */}
        <WritingStudioRoom prompts={prompts} />
      </div>
    </div>
  );
}
