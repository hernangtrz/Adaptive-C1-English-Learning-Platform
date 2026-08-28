import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { User, Compass, Clock, Globe, Shield, CheckCircle } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = user.profile ?? {
    currentCEFRLevel: "B2",
    targetCEFRLevel: "C1",
    dailyMinutes: 30,
    timezone: "UTC",
    nativeLanguage: "es",
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "48px 24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Your Learning Profile</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Manage your personal learning metrics, language goals, and daily practice settings.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Account Overview Card */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  color: "#ffffff",
                }}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 style={{ fontSize: "1.25rem" }}>{user.name || "Learner"}</h2>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>{user.email}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Compass size={18} color="#06b6d4" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target Trajectory</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {profile.currentCEFRLevel} ➔ {profile.targetCEFRLevel}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Daily Budget</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{profile.dailyMinutes} mins/day</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Globe size={18} color="#34d399" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Timezone</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{profile.timezone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Profile Form Card */}
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
