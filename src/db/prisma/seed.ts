import { PrismaClient } from "@prisma/client";
import { SEED_CONCEPTS } from "../../modules/concepts/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for Adaptive C1 Platform...");

  let seededCount = 0;
  for (const concept of SEED_CONCEPTS) {
    await prisma.learningConcept.upsert({
      where: {
        canonicalForm_type: {
          canonicalForm: concept.canonicalForm,
          type: concept.type,
        },
      },
      update: {
        meaning: concept.meaning,
        translationEs: concept.translationEs,
        cefrLevel: concept.cefrLevel,
        explanation: concept.explanation,
        phonetics: concept.phonetics,
        tags: concept.tags,
        examples: concept.examples,
      },
      create: {
        type: concept.type,
        canonicalForm: concept.canonicalForm,
        meaning: concept.meaning,
        translationEs: concept.translationEs,
        cefrLevel: concept.cefrLevel,
        explanation: concept.explanation,
        phonetics: concept.phonetics,
        tags: concept.tags,
        examples: concept.examples,
      },
    });
    seededCount++;
  }

  console.log(`✅ Successfully seeded ${seededCount} C1/B2 learning concepts into Supabase PostgreSQL.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
