"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div className="glass-card" style={{ maxWidth: "520px", width: "100%", padding: "36px", textAlign: "center" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(244, 63, 94, 0.15)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <AlertTriangle size={28} color="#fb7185" />
        </div>

        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Something went wrong</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: "24px" }}>
          An unexpected error occurred while loading this module. Please try again or return to the Dashboard.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button type="button" onClick={() => reset()} className="btn-secondary" style={{ padding: "10px 18px", gap: "6px" }}>
            <RotateCcw size={15} />
            <span>Try Again</span>
          </button>
          <Link href="/dashboard" className="btn-primary" style={{ padding: "10px 18px", gap: "6px" }}>
            <Home size={15} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
