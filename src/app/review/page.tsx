import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { ReviewService } from "@/modules/reviews/review.service";
import ReviewSession from "./ReviewSession";

export default async function ReviewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/review");
  }

  const queue = await ReviewService.getDueReviewQueue(user.id, 10);

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <ReviewSession initialQueue={queue} />
    </div>
  );
}
