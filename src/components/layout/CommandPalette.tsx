"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Flame,
  BookOpen,
  Zap,
  Headphones,
  Mic,
  PenTool,
  TrendingUp,
  LayoutDashboard,
  Clock,
  X,
} from "lucide-react";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const routes = [
    { name: "Dashboard Cockpit", href: "/dashboard", icon: LayoutDashboard, category: "Core" },
    { name: "Today's Daily Workout", href: "/training", icon: Sparkles, category: "Daily Practice" },
    { name: "Spaced Review Queue (FSRS)", href: "/review", icon: Zap, category: "Daily Practice" },
    { name: "Review Audit History", href: "/review/history", icon: Clock, category: "Analytics" },
    { name: "Macro Progress & C1 Analytics", href: "/progress", icon: TrendingUp, category: "Analytics" },
    { name: "Vocabulary & Passive Bottlenecks", href: "/vocabulary", icon: BookOpen, category: "Modules" },
    { name: "Advanced Grammar Inversions", href: "/grammar", icon: Zap, category: "Modules" },
    { name: "Listening & Connected Speech", href: "/listening", icon: Headphones, category: "Modules" },
    { name: "Spoken Fluency Simulation", href: "/speaking", icon: Mic, category: "Modules" },
    { name: "Writing & Register Studio", href: "/writing", icon: PenTool, category: "Modules" },
    { name: "C1 Concept Library", href: "/concepts", icon: BookOpen, category: "Reference" },
  ];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  function handleNavigate(href: string) {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "#0f172a",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          padding: 0,
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Search size={20} color="var(--accent-cyan)" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a module or shortcut... (e.g. speaking, review, grammar)"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "1rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
          {filteredRoutes.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No matching module found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredRoutes.map((r, i) => {
              const IconComp = r.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleNavigate(r.href)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(99, 102, 241, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconComp size={16} color="var(--accent-cyan)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ffffff" }}>{r.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.category}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Jump ➔</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(0, 0, 0, 0.2)",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Use <strong>Esc</strong> to close</span>
          <span>Shortcut: <strong>Ctrl + K</strong></span>
        </div>
      </div>
    </div>
  );
}
