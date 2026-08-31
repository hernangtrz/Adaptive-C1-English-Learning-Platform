import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/session";
import { DailyTrainingService } from "@/modules/training/training.service";
import DailyWorkoutRunner from "./DailyWorkoutRunner";

export default async function TrainingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?redirect=/training");
  }

  const workout = await DailyTrainingService.generateDailyWorkout(user.id);

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", padding: "40px 24px" }}>
      <DailyWorkoutRunner workout={workout} />
    </div>
  );
}
