import { describe, expect, test } from "bun:test";
import { accuracyPercent, findNewlyUnlocked, isUnlocked } from "../../lib/achievements/evaluate";
import { ACHIEVEMENT_BY_ID } from "../../lib/achievements/catalog";

const empty = {
  roundsCompleted: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  bestStreak: 0,
  perfectRounds: 0,
  falseIdentified: 0,
  trueMistakes: 0,
};

describe("achievements evaluate", () => {
  test("no unlock when conditions unmet", () => {
    expect(findNewlyUnlocked(empty, [])).toEqual([]);
  });

  test("unlocks first_step on first round", () => {
    const newly = findNewlyUnlocked({ ...empty, roundsCompleted: 1 }, []);
    expect(newly.map((a) => a.id)).toContain("first_step");
  });

  test("does not re-unlock existing", () => {
    const newly = findNewlyUnlocked({ ...empty, roundsCompleted: 5 }, ["first_step"]);
    expect(newly.map((a) => a.id)).not.toContain("first_step");
  });

  test("unlocks multiple in one pass", () => {
    const newly = findNewlyUnlocked({ ...empty, roundsCompleted: 1, perfectRounds: 1 }, []);
    const ids = newly.map((a) => a.id);
    expect(ids).toContain("first_step");
    expect(ids).toContain("perfectionist");
  });

  test("collector after 10 non-meta", () => {
    const base = [
      "first_step",
      "curious",
      "erudite",
      "connoisseur",
      "sharpshooter",
      "unbreakable",
      "perfectionist",
      "skeptic",
      "gullible",
      "veteran",
    ];
    const newly = findNewlyUnlocked(empty, base);
    expect(newly.map((a) => a.id)).toContain("collector");
  });

  test("legend after all others including collector", () => {
    const allButLegend = Object.keys(ACHIEVEMENT_BY_ID).filter((id) => id !== "legend");
    const newly = findNewlyUnlocked(empty, allButLegend);
    expect(newly.map((a) => a.id)).toContain("legend");
  });

  test("sharpshooter needs streak 10", () => {
    expect(isUnlocked(ACHIEVEMENT_BY_ID.sharpshooter, { ...empty, bestStreak: 9 }, new Set())).toBe(
      false,
    );
    expect(
      isUnlocked(ACHIEVEMENT_BY_ID.sharpshooter, { ...empty, bestStreak: 10 }, new Set()),
    ).toBe(true);
  });

  test("accuracy at zero answers is 0", () => {
    expect(accuracyPercent(0, 0)).toBe(0);
  });

  test("accuracy rounds to one decimal", () => {
    expect(accuracyPercent(1, 3)).toBe(33.3);
  });
});
