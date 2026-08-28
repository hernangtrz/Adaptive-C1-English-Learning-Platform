import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/auth/session";
import { ReviewService } from "@/modules/reviews/review.service";
import { Clock, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default async function ReviewHistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/review/history");
  }

  const reviews = await ReviewService.getUserReviewHistory(user.id, 50);

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <Link
              href="/review"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                textDecoration: "none",
                marginBottom: "8px",
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Review Session</span>
            </Link>
            <h1 style={{ fontSize: "2rem" }}>Review History & Audit Trail</h1>
          </div>
          <Link href="/review" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.88rem" }}>
            <RotateCcw size={16} />
            <span>Start Review</span>
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Clock size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No reviews recorded yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Complete your first retrieval session to generate immutable evidence and FSRS scheduling logs.
            </p>
            <Link href="/review" className="btn-primary">
              Start First Review
            </Link>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  <th style={{ padding: "12px 16px" }}>Time</th>
                  <th style={{ padding: "12px 16px" }}>Concept</th>
                  <th style={{ padding: "12px 16px" }}>Level</th>
                  <th style={{ padding: "12px 16px" }}>Exercise Type</th>
                  <th style={{ padding: "12px 16px" }}>Rating</th>
                  <th style={{ padding: "12px 16px" }}>Evidence Score</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => {
                  const concept = r.userLearningItem?.concept;
                  const isSuccess = r.rating === "GOOD" || r.rating === "EASY";
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                        {concept?.canonicalForm || "Unknown Concept"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span className="badge" style={{ fontSize: "0.7rem" }}>
                          {concept?.cefrLevel || "B2"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                        {r.reviewType}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            color: isSuccess ? "#34d399" : "#f43f5e",
                          }}
                        >
                          {isSuccess ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {r.rating}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                        {Math.round(r.evidenceScore * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
