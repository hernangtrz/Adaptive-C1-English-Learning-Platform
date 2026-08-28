"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, ArrowRight, AlertCircle, Lock, Mail, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Invalid email address or password.");
        setLoading(false);
        return;
      }

      // Success
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        maxWidth: "440px",
        width: "100%",
        padding: "40px 36px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(6, 182, 212, 0.12)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            border: "1px solid var(--border-active)",
          }}
        >
          <Sparkles size={24} color="#06b6d4" />
        </div>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>Welcome Back</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Sign in to continue your C1 adaptive training.
        </p>
      </div>

      {/* Registration Success Alert */}
      {registered && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#6ee7b7",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <CheckCircle2 size={18} />
          <span>Account created! You can now log in below.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fca5a5",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={18}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              marginBottom: "8px",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={18}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", marginTop: "8px", padding: "14px" }}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
        Don&apos;t have an account yet?{" "}
        <Link href="/auth/register" style={{ color: "var(--accent-cyan)", fontWeight: 600, textDecoration: "none" }}>
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <Suspense fallback={<div style={{ color: "var(--text-secondary)" }}>Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
