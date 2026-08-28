# Adaptive C1 English Learning Platform

An adaptive C1 English training system centered around retrieval practice, contextual repetition, spaced repetition (FSRS), and the conversion of passive language knowledge into active use.

## Core Architectural Layers

- **Frontend & App Framework**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Vanilla CSS Design System with custom tokens, dark mode palette, and modern typography (`Outfit` / `Inter`)
- **Database & ORM**: PostgreSQL (Supabase compatible) with Prisma ORM
- **Spaced Repetition**: `ts-fsrs` (Free Spaced Repetition Scheduler)
- **Unit & Integration Testing**: Vitest

---

## Directory Structure

```text
src/
  app/                    # Next.js App Router (pages, layouts, api routes)
    globals.css           # Modern design system & token definitions
    layout.tsx            # Root layout with fonts and metadata
    page.tsx              # Application home
    api/
      health/             # System health & connectivity check
  modules/                # Domain-driven modular monolith
    auth/                 # Authentication & authorization
    users/                # User learning profile & preferences
    concepts/             # Global learning concepts (vocabulary, grammar, collocations)
    learning/             # Active learning state & item tracking
    reviews/              # Review processing transactions
    fsrs/                 # FSRS card scheduling integration
    mastery/              # 3-Dimensional Mastery Engine (Recognition, Recall, Production)
    listening/            # Content pipelines, transcript segments, concept mapping
    speaking/             # Speaking evaluations & browser recording
    writing/              # Writing analysis & contextual correction
    exercises/            # Exercise generators & template renderers
    daily-training/       # Priority Engine & daily session builder
    progress/             # CEFR metrics & multi-dimensional progress tracking
  services/               # Replaceable infrastructure abstractions
    ai/                   # AI service interface (speaking/writing evaluation)
    speech/               # Speech-to-text service interface
    storage/              # Audio & media object storage abstraction
  db/                     # Database layer
    prisma.ts             # Global singleton Prisma client
    prisma/
      schema.prisma       # Prisma schema for PostgreSQL
  shared/                 # Shared utilities, constants, validation, types
    constants/            # Mastery & priority weights, thresholds
    types/                # Core domain types (MasteryState, CEFRLevel, etc.)
    validation/           # Zod schema validators & environment parsing
```

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and configure your Supabase connection strings:

```bash
cp .env.example .env.local
```

Set your Supabase credentials:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 2. Available Scripts

```bash
# Start local development server
npm run dev

# Run Vitest unit tests
npm test

# Run TypeScript type check
npm run typecheck

# Build for production
npm run build

# Generate Prisma Client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio
```
