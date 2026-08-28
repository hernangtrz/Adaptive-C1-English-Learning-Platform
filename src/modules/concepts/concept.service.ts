import { prisma } from "@/db/prisma";
import { ConceptType, CEFRLevel, MasteryState, Prisma } from "@prisma/client";

export interface ListConceptsFilter {
  type?: ConceptType;
  cefrLevel?: CEFRLevel;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface CreateConceptInput {
  type: ConceptType;
  canonicalForm: string;
  meaning: string;
  translationEs: string;
  cefrLevel?: CEFRLevel;
  explanation?: string;
  phonetics?: string;
  tags?: string[];
  examples?: Array<{
    sentence: string;
    translationEs: string;
    context: string;
  }>;
}

export class ConceptService {
  /**
   * Lists learning concepts with optional filtering, search, and pagination.
   */
  static async listConcepts(filter: ListConceptsFilter = {}) {
    const { type, cefrLevel, search, tag, page = 1, limit = 50 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.LearningConceptWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (cefrLevel) {
      where.cefrLevel = cefrLevel;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { canonicalForm: { contains: term, mode: "insensitive" } },
        { meaning: { contains: term, mode: "insensitive" } },
        { translationEs: { contains: term, mode: "insensitive" } },
      ];
    }

    const [concepts, total] = await Promise.all([
      prisma.learningConcept.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ cefrLevel: "asc" }, { canonicalForm: "asc" }],
      }),
      prisma.learningConcept.count({ where }),
    ]);

    return {
      concepts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves a single learning concept by ID.
   */
  static async getConceptById(id: string) {
    return prisma.learningConcept.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves a learning concept by canonical form and type.
   */
  static async getConceptByCanonicalForm(canonicalForm: string, type: ConceptType) {
    return prisma.learningConcept.findUnique({
      where: {
        canonicalForm_type: {
          canonicalForm: canonicalForm.trim(),
          type,
        },
      },
    });
  }

  /**
   * Creates a new learning concept.
   */
  static async createConcept(data: CreateConceptInput) {
    return prisma.learningConcept.create({
      data: {
        type: data.type,
        canonicalForm: data.canonicalForm.trim(),
        meaning: data.meaning.trim(),
        translationEs: data.translationEs.trim(),
        cefrLevel: data.cefrLevel ?? CEFRLevel.B2,
        explanation: data.explanation?.trim(),
        phonetics: data.phonetics?.trim(),
        tags: data.tags ?? [],
        examples: (data.examples as Prisma.InputJsonValue) ?? [],
      },
    });
  }

  /**
   * Updates an existing learning concept.
   */
  static async updateConcept(id: string, data: Partial<CreateConceptInput>) {
    return prisma.learningConcept.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.canonicalForm && { canonicalForm: data.canonicalForm.trim() }),
        ...(data.meaning && { meaning: data.meaning.trim() }),
        ...(data.translationEs && { translationEs: data.translationEs.trim() }),
        ...(data.cefrLevel && { cefrLevel: data.cefrLevel }),
        ...(data.explanation !== undefined && { explanation: data.explanation?.trim() }),
        ...(data.phonetics !== undefined && { phonetics: data.phonetics?.trim() }),
        ...(data.tags && { tags: data.tags }),
        ...(data.examples && { examples: data.examples as Prisma.InputJsonValue }),
      },
    });
  }

  /**
   * Deletes a learning concept.
   */
  static async deleteConcept(id: string) {
    return prisma.learningConcept.delete({
      where: { id },
    });
  }

  /**
   * Retrieves or initializes a personalized UserLearningItem for a given user and concept.
   */
  static async getOrCreateUserLearningItem(userId: string, conceptId: string) {
    let item = await prisma.userLearningItem.findUnique({
      where: {
        userId_conceptId: {
          userId,
          conceptId,
        },
      },
      include: {
        concept: true,
      },
    });

    if (!item) {
      item = await prisma.userLearningItem.create({
        data: {
          userId,
          conceptId,
          recognitionMastery: 0.0,
          recallMastery: 0.0,
          productionMastery: 0.0,
          overallMastery: 0.0,
          masteryState: MasteryState.DISCOVERED,
          productionGap: 0.0,
          fsrsState: 0,
        },
        include: {
          concept: true,
        },
      });
    }

    return item;
  }

  /**
   * Lists all learning items belonging to a user with their associated concepts.
   */
  static async listUserLearningItems(
    userId: string,
    options?: { masteryState?: MasteryState; limit?: number }
  ) {
    const where: Prisma.UserLearningItemWhereInput = { userId };
    if (options?.masteryState) {
      where.masteryState = options.masteryState;
    }

    return prisma.userLearningItem.findMany({
      where,
      include: { concept: true },
      take: options?.limit ?? 100,
      orderBy: [{ lastPracticedAt: "desc" }, { createdAt: "desc" }],
    });
  }
}
