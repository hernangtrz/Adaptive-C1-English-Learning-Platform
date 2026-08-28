import { ConceptService } from "@/modules/concepts/concept.service";
import { getCurrentUser } from "@/modules/auth/session";
import ConceptCard from "@/components/concepts/ConceptCard";
import { Sparkles, BookOpen, Filter, Search } from "lucide-react";
import Link from "next/link";
import { ConceptType, CEFRLevel } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    level?: string;
    q?: string;
  }>;
}

export default async function ConceptsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const typeFilter = params.type && params.type !== "ALL" ? (params.type as ConceptType) : undefined;
  const levelFilter = params.level && params.level !== "ALL" ? (params.level as CEFRLevel) : undefined;
  const searchQuery = params.q;

  const [{ concepts, total }, userItems] = await Promise.all([
    ConceptService.listConcepts({
      type: typeFilter,
      cefrLevel: levelFilter,
      search: searchQuery,
      limit: 100,
    }),
    user ? ConceptService.listUserLearningItems(user.id) : [],
  ]);

  const trackedConceptIds = new Set(userItems.map((item) => item.conceptId));

  const types = [
    { label: "All Concepts", value: "ALL" },
    { label: "Phrasal Verbs", value: "PHRASAL_VERB" },
    { label: "Collocations", value: "COLLOCATION" },
    { label: "Vocabulary", value: "VOCABULARY" },
    { label: "Expressions", value: "FUNCTIONAL_EXPRESSION" },
    { label: "Grammar", value: "GRAMMAR" },
  ];

  const levels = [
    { label: "All Levels", value: "ALL" },
    { label: "B2 Upper-Int", value: "B2" },
    { label: "C1 Advanced", value: "C1" },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(6, 182, 212, 0.12)",
              color: "#06b6d4",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} />
            KNOWLEDGE REPOSITORY
          </div>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "8px" }}>C1 & B2 Learning Concepts</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "700px" }}>
            Explore canonical phrasal verbs, high-impact collocations, and C1 discourse expressions designed
            to bridge the gap between passive understanding and spontaneous production.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="glass-card"
          style={{
            padding: "20px",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Search Input Form */}
          <form method="GET" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <input type="hidden" name="type" value={params.type || "ALL"} />
            <input type="hidden" name="level" value={params.level || "ALL"} />
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery || ""}
                placeholder="Search concepts by English term, meaning, or Spanish translation..."
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  outline: "none",
                }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: "0 24px" }}>
              Search
            </button>
          </form>

          {/* Type Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "6px" }}>Type:</span>
            {types.map((t) => {
              const isActive = (params.type || "ALL") === t.value;
              return (
                <Link
                  key={t.value}
                  href={`/concepts?type=${t.value}&level=${params.level || "ALL"}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: isActive ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "#ffffff" : "var(--text-secondary)",
                    border: isActive ? "1px solid var(--primary)" : "1px solid var(--border-subtle)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          {/* Level Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "6px" }}>Level:</span>
            {levels.map((l) => {
              const isActive = (params.level || "ALL") === l.value;
              return (
                <Link
                  key={l.value}
                  href={`/concepts?type=${params.type || "ALL"}&level=${l.value}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: isActive ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "#67e8f9" : "var(--text-muted)",
                    border: isActive ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Showing {concepts.length} of {total} concepts
            </span>
          </div>
        </div>

        {/* Concepts Grid */}
        {concepts.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <BookOpen size={36} color="var(--text-muted)" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No concepts found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Try adjusting your search query or removing active filters.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isTracked={trackedConceptIds.has(concept.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
