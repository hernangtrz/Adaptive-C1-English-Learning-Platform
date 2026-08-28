"use server";

import { ConceptService } from "./concept.service";
import { ConceptType, CEFRLevel } from "@prisma/client";
import { getCurrentUser } from "@/modules/auth/session";

/**
 * Server action to fetch concepts with search and filtering.
 */
export async function getConceptsAction(filters: {
  type?: string;
  cefrLevel?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const typeEnum = filters.type && filters.type !== "ALL" ? (filters.type as ConceptType) : undefined;
    const levelEnum = filters.cefrLevel && filters.cefrLevel !== "ALL" ? (filters.cefrLevel as CEFRLevel) : undefined;

    const result = await ConceptService.listConcepts({
      type: typeEnum,
      cefrLevel: levelEnum,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load concepts.";
    return {
      success: false,
      message,
    };
  }
}

/**
 * Server action to add a concept to the current user's active learning list.
 */
export async function trackConceptAction(conceptId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to add concepts to your training queue.",
      };
    }

    const item = await ConceptService.getOrCreateUserLearningItem(user.id, conceptId);
    return {
      success: true,
      message: "Concept added to your active training trajectory.",
      data: item,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to track concept.";
    return {
      success: false,
      message,
    };
  }
}
