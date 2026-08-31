import { prisma } from "@/db/prisma";
import {
  DailyWorkoutPlan,
  WorkoutBlock,
  UserStreakInfo,
  SpacedReviewBlock,
  PassiveToActiveBlock,
  NewConceptBlock,
  GrammarPrecisionBlock,
  ListeningChallengeBlock,
  ActiveProductionBlock,
} from "./types";
import { FSRSService } from "@/modules/fsrs/fsrs.service";
import { ReviewService } from "@/modules/reviews/review.service";
import { C1_GRAMMAR_TRANSFORMATIONS } from "@/modules/grammar/grammar-seed";
import { C1_LISTENING_EXERCISES } from "@/modules/listening/listening-seed";

export class DailyTrainingService {
  /**
   * Generates a personalized daily workout tailored to the learner's time budget,
   * spaced repetition queue, and active bottlenecks.
   */
  static async generateDailyWorkout(userId: string): Promise<DailyWorkoutPlan> {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Fetch User Profile & Time Budget
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    const budgetMinutes = profile?.dailyMinutes ?? 30;

    // 2. Fetch Streak Info
    const streakInfo = await this.getUserStreakInfo(userId);

    // 3. Stage 1: Spaced Repetition Warmup (Due items)
    const dueQueue = await ReviewService.getDueReviewQueue(
      userId,
      budgetMinutes <= 15 ? 4 : budgetMinutes <= 30 ? 6 : 10
    );

    const blocks: WorkoutBlock[] = [];

    if (dueQueue.length > 0) {
      const warmupBlock: SpacedReviewBlock = {
        type: "SPACED_REVIEW",
        title: "Spaced Retrieval Warmup",
        description: `Review ${dueQueue.length} memory cards scheduled for optimal retention today.`,
        items: dueQueue,
        estimatedMinutes: Math.max(3, Math.round(dueQueue.length * 0.8)),
      };
      blocks.push(warmupBlock);
    }

    // 4. Stage 2: Passive ➔ Active Bottleneck Targeting (Highest production gap)
    const passiveBottlenecks = await prisma.userLearningItem.findMany({
      where: {
        userId,
        productionGap: { gte: 0.2 },
      },
      include: { concept: true },
      orderBy: { productionGap: "desc" },
      take: budgetMinutes <= 15 ? 1 : 2,
    });

    for (const item of passiveBottlenecks) {
      const concept = item.concept;
      const bottleneckBlock: PassiveToActiveBlock = {
        type: "PASSIVE_TO_ACTIVE",
        title: `Passive ➔ Active Activation: "${concept.canonicalForm}"`,
        description: `High recall (${Math.round(item.recallMastery * 100)}%) but low spontaneous production (${Math.round(item.productionMastery * 100)}%). Activate it now!`,
        concept,
        productionGap: item.productionGap,
        prompt: `Compose a complete, natural sentence demonstrating active mastery of "${concept.canonicalForm}":`,
        scenario: `Express an authentic thought or executive observation using "${concept.canonicalForm}".`,
        estimatedMinutes: 3,
      };
      blocks.push(bottleneckBlock);
    }

    // 5. Stage 3: New Concept Acquisition (if time permits)
    if (budgetMinutes >= 20) {
      const trackedConceptIds = (
        await prisma.userLearningItem.findMany({
          where: { userId },
          select: { conceptId: true },
        })
      ).map((i) => i.conceptId);

      const newConcept = await prisma.learningConcept.findFirst({
        where: {
          id: { notIn: trackedConceptIds },
        },
      });

      if (newConcept) {
        const examples = Array.isArray(newConcept.examples)
          ? (newConcept.examples as Array<{ sentence: string; translationEs: string }>)
          : [];

        const newConceptBlock: NewConceptBlock = {
          type: "NEW_CONCEPT",
          title: `New Concept Acquisition: "${newConcept.canonicalForm}"`,
          description: `Expand your C1 lexicon with this high-frequency expression (${newConcept.cefrLevel}).`,
          concept: newConcept,
          examples,
          estimatedMinutes: 4,
        };
        blocks.push(newConceptBlock);
      }
    }

    // 6. Stage 4: C1 Grammar Precision Drill
    const grammarExercise = C1_GRAMMAR_TRANSFORMATIONS[Math.floor(Math.random() * C1_GRAMMAR_TRANSFORMATIONS.length)];
    const grammarBlock: GrammarPrecisionBlock = {
      type: "GRAMMAR_PRECISION",
      title: `Grammar Transformation: ${grammarExercise.title}`,
      description: "Perform an advanced sentence transformation utilizing mandatory C1 syntax.",
      exercise: grammarExercise,
      estimatedMinutes: 3,
    };
    blocks.push(grammarBlock);

    // 7. Stage 5: Acoustic Micro-Listening Challenge
    const listeningExercise = C1_LISTENING_EXERCISES[Math.floor(Math.random() * C1_LISTENING_EXERCISES.length)];
    const listeningBlock: ListeningChallengeBlock = {
      type: "LISTENING_CHALLENGE",
      title: `Micro-Listening: ${listeningExercise.title}`,
      description: "Listen to rapid native speech and decode acoustic reductions.",
      exercise: listeningExercise,
      estimatedMinutes: 4,
    };
    blocks.push(listeningBlock);

    // 8. Stage 6: Active Output Synthesis Challenge
    const targetA = dueQueue[0]?.concept.canonicalForm || "figure out";
    const targetB = dueQueue[1]?.concept.canonicalForm || "play a pivotal role";

    const productionBlock: ActiveProductionBlock = {
      type: "ACTIVE_PRODUCTION",
      title: "Daily Synthesis & Output Challenge",
      description: `Integrate at least one of today's target expressions into an articulate response.`,
      targetConcepts: [
        { canonicalForm: targetA, translationEs: "Concept A" },
        { canonicalForm: targetB, translationEs: "Concept B" },
      ],
      prompt: `Describe a recent challenge or strategic decision where you had to analyze data or reach a consensus. Incorporate "${targetA}" or "${targetB}".`,
      sampleAcceptable: `In our recent retrospective, we had to ${targetA} the performance bottleneck before the release.`,
      estimatedMinutes: 5,
    };
    blocks.push(productionBlock);

    const totalEstimatedMinutes = blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0);

    return {
      id: `workout_${userId}_${todayStr}`,
      userId,
      date: todayStr,
      dailyMinutesBudget: budgetMinutes,
      totalEstimatedMinutes,
      blocks,
      streakDays: streakInfo.currentStreak,
      isCompletedToday: streakInfo.practicedToday,
    };
  }

  /**
   * Calculates the user's consecutive practice streak from review logs.
   */
  static async getUserStreakInfo(userId: string): Promise<UserStreakInfo> {
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (reviews.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticedDate: null,
        practicedToday: false,
        totalReviewsAllTime: 0,
      };
    }

    // Set of distinct practice date strings (YYYY-MM-DD)
    const practiceDates = new Set(
      reviews.map((r) => r.createdAt.toISOString().split("T")[0])
    );

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const practicedToday = practiceDates.has(todayStr);

    let currentStreak = 0;
    let checkDate = practicedToday ? today : yesterday;

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (practiceDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const sortedDates = Array.from(practiceDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const curr = new Date(dStr);
      if (prevDate) {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = curr;
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastPracticedDate: reviews[0].createdAt.toISOString().split("T")[0],
      practicedToday,
      totalReviewsAllTime: reviews.length,
    };
  }
}
