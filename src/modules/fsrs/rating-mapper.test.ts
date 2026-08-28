import { describe, it, expect } from "vitest";
import {
  scoreToFSRSRating,
  toTsFsrsRating,
  fromTsFsrsRating,
} from "./rating-mapper";
import { Rating } from "ts-fsrs";

describe("FSRS Rating Mapper", () => {
  describe("Score to Rating Thresholds", () => {
    it("should map scores below 0.50 to AGAIN", () => {
      expect(scoreToFSRSRating(0.0)).toBe("AGAIN");
      expect(scoreToFSRSRating(0.25)).toBe("AGAIN");
      expect(scoreToFSRSRating(0.49)).toBe("AGAIN");
    });

    it("should map scores from 0.50 to 0.69 to HARD", () => {
      expect(scoreToFSRSRating(0.5)).toBe("HARD");
      expect(scoreToFSRSRating(0.6)).toBe("HARD");
      expect(scoreToFSRSRating(0.69)).toBe("HARD");
    });

    it("should map scores from 0.70 to 0.89 to GOOD", () => {
      expect(scoreToFSRSRating(0.7)).toBe("GOOD");
      expect(scoreToFSRSRating(0.8)).toBe("GOOD");
      expect(scoreToFSRSRating(0.89)).toBe("GOOD");
    });

    it("should map scores from 0.90 to 1.00 to EASY", () => {
      expect(scoreToFSRSRating(0.9)).toBe("EASY");
      expect(scoreToFSRSRating(0.95)).toBe("EASY");
      expect(scoreToFSRSRating(1.0)).toBe("EASY");
    });

    it("should clamp out-of-bound scores correctly", () => {
      expect(scoreToFSRSRating(-0.5)).toBe("AGAIN");
      expect(scoreToFSRSRating(1.5)).toBe("EASY");
    });
  });

  describe("Hint and Assistance Penalties", () => {
    it("should downgrade EASY to GOOD if 1 hint was used", () => {
      const rating = scoreToFSRSRating(0.95, { hintsUsed: 1 });
      expect(rating).toBe("GOOD");
    });

    it("should preserve GOOD if 1 hint was used with a 0.80 score", () => {
      const rating = scoreToFSRSRating(0.8, { hintsUsed: 1 });
      expect(rating).toBe("GOOD");
    });

    it("should downgrade to HARD if 2 or more hints were used", () => {
      expect(scoreToFSRSRating(1.0, { hintsUsed: 2 })).toBe("HARD");
      expect(scoreToFSRSRating(0.85, { hintsUsed: 3 })).toBe("HARD");
    });

    it("should downgrade to HARD if requiredAssistance is true even with 1.0 score", () => {
      const rating = scoreToFSRSRating(1.0, { requiredAssistance: true });
      expect(rating).toBe("HARD");
    });

    it("should keep AGAIN as AGAIN even with hints", () => {
      expect(scoreToFSRSRating(0.3, { hintsUsed: 2 })).toBe("AGAIN");
    });
  });

  describe("Enum Conversions", () => {
    it("should convert domain strings to ts-fsrs numeric ratings", () => {
      expect(toTsFsrsRating("AGAIN")).toBe(Rating.Again);
      expect(toTsFsrsRating("HARD")).toBe(Rating.Hard);
      expect(toTsFsrsRating("GOOD")).toBe(Rating.Good);
      expect(toTsFsrsRating("EASY")).toBe(Rating.Easy);
    });

    it("should convert ts-fsrs numeric ratings to domain strings", () => {
      expect(fromTsFsrsRating(Rating.Again)).toBe("AGAIN");
      expect(fromTsFsrsRating(Rating.Hard)).toBe("HARD");
      expect(fromTsFsrsRating(Rating.Good)).toBe("GOOD");
      expect(fromTsFsrsRating(Rating.Easy)).toBe("EASY");
    });
  });
});
