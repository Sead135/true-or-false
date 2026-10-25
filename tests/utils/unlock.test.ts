import { describe, expect, test } from "bun:test";
import { isLevelUnlocked } from "../../app/utils/unlock";

describe("isLevelUnlocked", () => {
  test("order 1 always unlocked", () => {
    expect(isLevelUnlocked(1, new Map())).toBe(true);
  });
  test("order 2 locked without stars on 1", () => {
    expect(isLevelUnlocked(2, new Map([[1, { stars: 0 }]]))).toBe(false);
  });
  test("order 2 unlocked when level 1 has >=1 star", () => {
    expect(isLevelUnlocked(2, new Map([[1, { stars: 1 }]]))).toBe(true);
  });
});
