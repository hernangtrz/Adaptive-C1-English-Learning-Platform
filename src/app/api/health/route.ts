import { NextResponse } from "next/server";
import { env } from "@/shared/validation/env";
import { prisma } from "@/db/prisma";

export async function GET() {
  let dbStatus = "unreachable";
  let dbError: string | null = null;

  try {
    // Attempt a lightweight query to test DB connectivity if configured
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err: unknown) {
    dbStatus = "disconnected_or_not_configured";
    dbError = err instanceof Error ? err.message : "Unknown error connecting to database";
  }

  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      architecture: {
        framework: "Next.js 15 (App Router)",
        runtime: "Node.js (TypeScript)",
        database: "PostgreSQL (Prisma)",
        dbConnectionStatus: dbStatus,
        dbError: dbError,
        spacedRepetition: "ts-fsrs",
      },
    },
    { status: 200 }
  );
}
