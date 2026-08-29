import Link from "next/link";
import { ListeningService } from "@/modules/listening/listening.service";
import { ListeningCategory } from "@/modules/listening/types";
import ListeningLab from "./ListeningLab";
import {
  Headphones,
  Sparkles,
  Zap,
  Volume2,
  Mic,
  Activity,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function ListeningPage({ searchParams }: PageProps) {
  const { category } = await searchParams;

  const tracks = ListeningService.getListeningTracks();
  const activeCategory = category as ListeningCategory | undefined;
  const exercises = ListeningService.getListeningExercises(activeCategory);

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
            <Headphones size={14} />
            ACOUSTIC DECODING & CONNECTED SPEECH LAB
          </div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px" }}>C1 Listening & Acoustic Parsing</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "760px", lineHeight: 1.6 }}>
            Overcome the bottleneck of fast native speech by mastering reduced vowels, weak forms, elision,
            and linking consonants through real-time micro-dictation and shadowing.
          </p>
        </div>

        {/* Category Tracks Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                      {t.exerciseCount} audio clip{t.exerciseCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: "8px" }}>{t.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "18px" }}>
                    {t.description}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/listening?category=${t.category}`}
                    className={isSelected ? "btn-primary" : "btn-secondary"}
                    style={{ width: "100%", fontSize: "0.82rem", padding: "8px 14px", justifyContent: "center" }}
                  >
                    {isSelected ? "Active in Lab" : "Select Track"}
                  </Link>
                </div>
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
              href="/listening"
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
              All Tracks ({ListeningService.getListeningExercises().length})
            </Link>
            {tracks.map((t) => (
              <Link
                key={t.category}
                href={`/listening?category=${t.category}`}
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
            <span>Daily Review Queue</span>
          </Link>
        </div>

        {/* Interactive Lab Workspace */}
        <ListeningLab exercises={exercises} />
      </div>
    </div>
  );
}
