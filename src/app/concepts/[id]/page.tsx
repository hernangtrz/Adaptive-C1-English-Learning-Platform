import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/modules/auth/session";
import { ExerciseGeneratorService } from "@/modules/exercises/generator.service";
import ConceptDrillSuite from "@/components/exercises/ConceptDrillSuite";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle,
  Eye,
  Activity,
  Compass,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [concept, allConcepts, userItem] = await Promise.all([
    prisma.learningConcept.findUnique({
      where: { id },
    }),
    prisma.learningConcept.findMany({
      take: 20,
    }),
    user
      ? prisma.userLearningItem.findUnique({
          where: {
            userId_conceptId: {
              userId: user.id,
              conceptId: id,
            },
          },
        })
      : null,
  ]);

  if (!concept) {
    notFound();
  }

  const exerciseSuite = ExerciseGeneratorService.generateConceptExerciseSuite(
    concept,
    allConcepts
  );

  const examples = Array.isArray(concept.examples)
    ? (concept.examples as Array<{ sentence: string; translationEs: string; context?: string }>)
    : [];

  const recMastery = userItem?.recognitionMastery ?? 0.0;
  const recallMastery = userItem?.recallMastery ?? 0.0;
  const prodMastery = userItem?.productionMastery ?? 0.0;
  const overallMastery = userItem?.overallMastery ?? 0.0;
  const prodGap = userItem?.productionGap ?? 0.0;
  const masteryState = userItem?.masteryState ?? "DISCOVERED";

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Back Link */}
        <Link
          href="/concepts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            textDecoration: "none",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Concepts Library</span>
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }}>
          {/* Concept Overview Card */}
          <div className="glass-card" style={{ padding: "36px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--accent-cyan)",
                    background: "rgba(6, 182, 212, 0.1)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    marginRight: "8px",
                  }}
                >
                  {concept.type.replace("_", " ")}
                </span>
                <span className={concept.cefrLevel === "C1" ? "badge badge-c1" : "badge"}>
                  {concept.cefrLevel} Level
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Current State:</span>
                <span className="badge badge-success">{masteryState}</span>
              </div>
            </div>

            <h1
              style={{
                fontSize: "2.4rem",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              {concept.canonicalForm}
            </h1>

            {concept.phonetics && (
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "16px" }}>
                {concept.phonetics}
              </div>
            )}

            <div style={{ fontSize: "1.1rem", color: "var(--text-primary)", lineHeight: 1.6, marginBottom: "16px" }}>
              {concept.meaning}
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                color: "#67e8f9",
                fontSize: "0.92rem",
                marginBottom: "24px",
              }}
            >
              <strong>Spanish Translation:</strong> {concept.translationEs}
            </div>

            {/* Explanation & Usage Notes */}
            {concept.explanation && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Usage & Linguistic Notes
                </h4>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  {concept.explanation}
                </p>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                  Authentic Context Examples
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {examples.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {ex.context && (
                        <div style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "4px" }}>
                          {ex.context}
                        </div>
                      )}
                      <div style={{ fontSize: "0.95rem", fontStyle: "italic", marginBottom: "6px" }}>
                        &ldquo;{ex.sentence}&rdquo;
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {ex.translationEs}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Mastery Progression Breakdown */}
          {user && (
            <div className="glass-card" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Your Language Competence Breakdown</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                    <span>Recognition (20%)</span>
                    <strong>{Math.round(recMastery * 100)}%</strong>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${recMastery * 100}%`, height: "100%", background: "#818cf8" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                    <span>Recall (30%)</span>
                    <strong>{Math.round(recallMastery * 100)}%</strong>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${recallMastery * 100}%`, height: "100%", background: "#38bdf8" }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "6px" }}>
                    <span>Production (50%)</span>
                    <strong>{Math.round(prodMastery * 100)}%</strong>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${prodMastery * 100}%`, height: "100%", background: "#34d399" }} />
                  </div>
                </div>
              </div>

              {prodGap > 0.3 && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    color: "#fbbf24",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    High Production Gap ({Math.round(prodGap * 100)}%): You recognize this expression well, but need active sentence production practice!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progressive Drill Suite */}
          <ConceptDrillSuite suite={exerciseSuite} />
        </div>
      </div>
    </div>
  );
}
