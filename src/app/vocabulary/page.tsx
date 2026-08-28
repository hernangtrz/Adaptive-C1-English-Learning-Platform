import Link from "next/link";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/modules/auth/session";
import ConceptCard from "@/components/concepts/ConceptCard";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Layers,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function VocabularyPage({ searchParams }: PageProps) {
  const { tab = "all" } = await searchParams;
  const user = await getCurrentUser();

  const [allConcepts, userItems] = await Promise.all([
    prisma.learningConcept.findMany({
      orderBy: [{ cefrLevel: "asc" }, { canonicalForm: "asc" }],
    }),
    user
      ? prisma.userLearningItem.findMany({
          where: { userId: user.id },
          include: { concept: true },
        })
      : [],
  ]);

  const trackedIds = new Set(userItems.map((i) => i.conceptId));
  const itemsMap = new Map(userItems.map((i) => [i.conceptId, i]));

  // Categorize into tracks
  const phrasalVerbs = allConcepts.filter((c) => c.type === "PHRASAL_VERB");
  const collocations = allConcepts.filter((c) => c.type === "COLLOCATION" || c.type === "FUNCTIONAL_EXPRESSION");
  const precisionVocab = allConcepts.filter((c) => c.type === "VOCABULARY");

  // Filter based on active tab
  let displayedConcepts = allConcepts;
  if (tab === "phrasal") {
    displayedConcepts = phrasalVerbs;
  } else if (tab === "collocations") {
    displayedConcepts = collocations;
  } else if (tab === "precision") {
    displayedConcepts = precisionVocab;
  } else if (tab === "passive") {
    // High production gap items (passive knowledge)
    const passiveConceptIds = new Set(
      userItems.filter((i) => i.productionGap >= 0.3).map((i) => i.conceptId)
    );
    displayedConcepts = allConcepts.filter((c) => passiveConceptIds.has(c.id));
  } else if (tab === "mastered") {
    const masteredConceptIds = new Set(
      userItems.filter((i) => i.masteryState === "MASTERED").map((i) => i.conceptId)
    );
    displayedConcepts = allConcepts.filter((c) => masteredConceptIds.has(c.id));
  }

  const passiveCount = userItems.filter((i) => i.productionGap >= 0.3).length;
  const masteredCount = userItems.filter((i) => i.masteryState === "MASTERED").length;

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
              background: "rgba(99, 102, 241, 0.12)",
              color: "#818cf8",
              fontSize: "0.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} />
            PASSIVE ➔ ACTIVE VOCABULARY ENGINE
          </div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Vocabulary & Phrasal Verbs</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
            Progress from passive recognition to active, spontaneous production with structured tracks,
            collocation pairing, and targeted bottleneck elimination.
          </p>
        </div>

        {/* Tracks Overview Banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginBottom: "36px",
          }}
        >
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Phrasal Verbs</div>
              <span className="badge badge-c1">{phrasalVerbs.length} terms</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
              High-frequency multi-word verbs essential for natural fluency and nuance.
            </p>
            <Link href="/vocabulary?tab=phrasal" className="btn-secondary" style={{ fontSize: "0.82rem", padding: "8px 14px" }}>
              View Track
            </Link>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Collocations & Discourse</div>
              <span className="badge" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                {collocations.length} terms
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
              Elevated C1 pairings and conversational discourse connectors for structured arguments.
            </p>
            <Link href="/vocabulary?tab=collocations" className="btn-secondary" style={{ fontSize: "0.82rem", padding: "8px 14px" }}>
              View Track
            </Link>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Precision Vocabulary</div>
              <span className="badge badge-success">{precisionVocab.length} terms</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px" }}>
              Exact adjectives and verbs that eliminate common false friends and replace generic words.
            </p>
            <Link href="/vocabulary?tab=precision" className="btn-secondary" style={{ fontSize: "0.82rem", padding: "8px 14px" }}>
              View Track
            </Link>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div
          className="glass-card"
          style={{
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            {[
              { id: "all", label: `All (${allConcepts.length})` },
              { id: "phrasal", label: `Phrasal Verbs (${phrasalVerbs.length})` },
              { id: "collocations", label: `Collocations (${collocations.length})` },
              { id: "precision", label: `Precision Vocab (${precisionVocab.length})` },
              { id: "passive", label: `Passive Bottlenecks (${passiveCount})` },
              { id: "mastered", label: `Mastered (${masteredCount})` },
            ].map((t) => {
              const isActive = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/vocabulary?tab=${t.id}`}
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

          <Link href="/review" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
            <Zap size={14} />
            <span>Launch Retrieval Session</span>
          </Link>
        </div>

        {/* Grid of Concepts */}
        {displayedConcepts.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <BookOpen size={36} color="var(--text-muted)" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No concepts found in this filter</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
              {tab === "passive"
                ? "You currently have no passive vocabulary bottlenecks."
                : tab === "mastered"
                ? "Keep practicing retrieval drills to achieve mastered status on your queued concepts!"
                : "Explore other tracks to start practicing."}
            </p>
            <Link href="/vocabulary" className="btn-secondary">
              View All Vocabulary
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {displayedConcepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isTracked={trackedIds.has(concept.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
