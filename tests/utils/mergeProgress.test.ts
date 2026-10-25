import { describe, expect, test } from "bun:test";
import { mergeProgress } from "../../app/utils/mergeProgress";

describe("mergeProgress", () => {
  test("keeps higher stars", () => {
    const local = [
      { levelId: "a", stars: 3, bestCorrect: 10, bestTotal: 10, completedAt: "2026-01-01" },
    ];
    const remote = [
      { levelId: "a", stars: 1, bestCorrect: 5, bestTotal: 10, completedAt: "2026-01-02" },
    ];
    expect(mergeProgress(local, remote)[0].stars).toBe(3);
  });
  test("on equal stars prefers higher bestCorrect", () => {
    const local = [{ levelId: "a", stars: 2, bestCorrect: 8, bestTotal: 10, completedAt: null }];
    const remote = [{ levelId: "a", stars: 2, bestCorrect: 7, bestTotal: 10, completedAt: null }];
    expect(mergeProgress(local, remote)[0].bestCorrect).toBe(8);
  });
});
