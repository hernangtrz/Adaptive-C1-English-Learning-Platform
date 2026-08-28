import { describe, it, expect } from "vitest";
import { SEED_CONCEPTS } from "./seed-data";

describe("Seed Concepts Integrity", () => {
  it("should contain a curated list of at least 20 concepts", () => {
    expect(SEED_CONCEPTS.length).toBeGreaterThanOrEqual(20);
  });

  it("should include all required C1/B2 concept types", () => {
    const types = new Set(SEED_CONCEPTS.map((c) => c.type));
    expect(types.has("VOCABULARY")).toBe(true);
    expect(types.has("PHRASAL_VERB")).toBe(true);
    expect(types.has("COLLOCATION")).toBe(true);
    expect(types.has("FUNCTIONAL_EXPRESSION")).toBe(true);
    expect(types.has("GRAMMAR")).toBe(true);
  });

  it("should validate that every concept has complete required fields", () => {
    for (const c of SEED_CONCEPTS) {
      expect(c.canonicalForm.trim().length).toBeGreaterThan(0);
      expect(c.meaning.trim().length).toBeGreaterThan(0);
      expect(c.translationEs.trim().length).toBeGreaterThan(0);
      expect(["B1", "B2", "C1", "C2"]).toContain(c.cefrLevel);
      expect(c.examples.length).toBeGreaterThan(0);

      for (const ex of c.examples) {
        expect(ex.sentence.trim().length).toBeGreaterThan(0);
        expect(ex.translationEs.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("should have unique canonical forms per concept type", () => {
    const keys = new Set<string>();
    for (const c of SEED_CONCEPTS) {
      const key = `${c.canonicalForm.toLowerCase()}::${c.type}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });
});
