import { describe, expect, test } from "bun:test";
import { levelFromXp, xpToReachLevel } from "../../lib/xp";

describe("xp / levels", () => {
  test("level 1 at 0 xp", () => {
    const info = levelFromXp(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
    expect(info.xpForNext).toBe(100);
  });

  test("reaches level 2 at 100 xp", () => {
    expect(xpToReachLevel(2)).toBe(100);
    const info = levelFromXp(100);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(0);
  });

  test("progress within level", () => {
    const info = levelFromXp(150);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(50);
    expect(info.xpForNext).toBe(200);
    expect(info.progress).toBe(0.25);
  });
});
