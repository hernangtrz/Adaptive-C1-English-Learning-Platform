import { UserMasteryOverview } from "@/modules/mastery/types";
import { UserStreakInfo } from "@/modules/training/types";
import { User, UserProfile, UserLearningItem, LearningConcept, Review } from "@prisma/client";

export interface WeeklyActivityDay {
  date: string;       // YYYY-MM-DD
  dayName: string;    // Mon, Tue, etc.
  count: number;      // number of reviews
  minutesEstimated: number;
}

export interface BottleneckItem {
  id: string;
  conceptId: string;
  canonicalForm: string;
  type: string;
  cefrLevel: string;
  translationEs: string;
  recallMastery: number;
  productionMastery: number;
  productionGap: number;
}

export interface DashboardData {
  user: User & { profile: UserProfile | null };
  mastery: UserMasteryOverview;
  streak: UserStreakInfo;
  dueCount: number;
  c1ReadinessScore: number; // 0 to 100
  readinessBand: "Developing (B2)" | "Progressing (B2+)" | "Operational (C1-)" | "Advanced Fluent (C1)";
  totalConceptsInLibrary: number;
  highGapBottlenecks: BottleneckItem[];
  recentReviews: Array<Review & { userLearningItem: { concept: LearningConcept } }>;
  weeklyActivity: WeeklyActivityDay[];
}
