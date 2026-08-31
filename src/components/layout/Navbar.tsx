import Link from "next/link";
import { getCurrentUser } from "@/modules/auth/session";
import { Sparkles, User as UserIcon, LogOut, Compass } from "lucide-react";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(9, 13, 22, 0.8)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem" }}>
              C1 Adaptive
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              ENGLISH MASTERY
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            href="/dashboard"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/training"
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#fbbf24",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Today's Training</span>
          </Link>
          <Link
            href="/review"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--accent-cyan)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Review
          </Link>
          <Link
            href="/vocabulary"
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Vocabulary
          </Link>
          <Link
            href="/grammar"
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Grammar
          </Link>
          <Link
            href="/listening"
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Listening
          </Link>
          <Link
            href="/speaking"
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Speaking
          </Link>
          <Link
            href="/concepts"
            style={{
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color var(--transition-fast)",
            }}
          >
            Concepts Library
          </Link>
        </nav>

        {/* User Navigation / Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user ? (
            <>
              {/* Level Progress Indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Compass size={14} color="#06b6d4" />
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Target:</span>
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--accent-cyan)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {user.profile?.currentCEFRLevel ?? "B2"} → {user.profile?.targetCEFRLevel ?? "C1"}
                </span>
              </div>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                <UserIcon size={16} />
                <span>{user.name || "Profile"}</span>
              </Link>

              {/* Logout Form */}
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    color: "var(--text-muted)",
                  }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="btn-secondary"
                style={{ padding: "8px 18px", fontSize: "0.88rem" }}
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.88rem" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
