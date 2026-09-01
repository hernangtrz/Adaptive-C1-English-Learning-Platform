"use server";

import { ProgressService } from "./progress.service";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to fetch comprehensive macro C1 progress audit report.
 */
export async function getProgressReportAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to view your progress audit.",
      };
    }

    const report = await ProgressService.getProgressReport(user.id);
    return {
      success: true,
      data: report,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load progress report.";
    return {
      success: false,
      message,
    };
  }
}
