import Link from "next/link";
import { GrammarService } from "@/modules/grammar/grammar.service";
import { GrammarCategory } from "@/modules/grammar/types";
import GrammarPracticeLab from "./GrammarPracticeLab";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  Layers,
  Code2,
  Workflow,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function GrammarPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  const tracks = GrammarService.getGrammarTracks();
  const activeCategory = category as GrammarCategory | undefined;

  const transformations = GrammarService.getTransformations(activeCategory);
  const errors = GrammarService.getErrorIdentifications(activeCategory);

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
              background: "rgba(99, 102, 241, 0.12)",
              color: "#818cf8",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} />
            C1 ADVANCED SYNTAX & STRUCTURE LAB
          </div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Advanced Grammar Engine</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
            Master nuanced sentence inversion, mixed counterfactual conditionals, cleft sentence focusing,
            and mandative subjunctive structures through active sentence transformation and error analysis.
          </p>
        </div>

        {/* Category Tracks Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "18px",
            marginBottom: "36px",
          }}
        >
          {tracks.map((t) => {
            const isSelected = activeCategory === t.category;
            return (
              <div
                key={t.category}
                className="glass-card"
                style={{
                  padding: "24px",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(99, 102, 241, 0.08)" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="badge badge-c1" style={{ fontSize: "0.7rem" }}>
                      {t.badge}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {t.transformationCount + t.errorCount} exercises
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>{t.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "18px" }}>
                    {t.description}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/grammar?category=${t.category}`}
                    className={isSelected ? "btn-primary" : "btn-secondary"}
                    style={{ width: "100%", fontSize: "0.82rem", padding: "8px 14px", justifyContent: "center" }}
                  >
                    {isSelected ? "Active Track in Lab" : "Select Category"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Filter Pills & Reset */}
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
              href="/grammar"
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
              All Categories
            </Link>
            {tracks.map((t) => (
              <Link
                key={t.category}
                href={`/grammar?category=${t.category}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: activeCategory === t.category ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                  color: activeCategory === t.category ? "#ffffff" : "var(--text-secondary)",
                  border: activeCategory === t.category ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                }}
              >
                {t.title.split(" ")[0]}
              </Link>
            ))}
          </div>

          <Link href="/review" className="btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
            <Zap size={14} />
            <span>Spaced Retrieval Queue</span>
          </Link>
        </div>

        {/* Interactive Practice Lab */}
        <GrammarPracticeLab
          transformations={transformations}
          errors={errors}
        />
      </div>
    </div>
  );
}
