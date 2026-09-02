import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 1.5s infinite",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
        }}
      >
        <Sparkles size={24} color="#ffffff" />
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>
        Loading C1 Learning Environment...
      </div>
    </div>
  );
}
