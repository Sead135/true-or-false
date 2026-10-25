import { describe, expect, test } from "bun:test";
import { computeStars } from "../../app/utils/stars";

describe("computeStars", () => {
  test("0 when below 50%", () => {
    expect(computeStars(4, 10)).toBe(0);
  });
  test("1 at 50%", () => {
    expect(computeStars(5, 10)).toBe(1);
  });
  test("2 at 75%", () => {
    expect(computeStars(75, 100)).toBe(2);
  });
  test("3 at 100%", () => {
    expect(computeStars(10, 10)).toBe(3);
  });
  test("0 when total is 0", () => {
    expect(computeStars(0, 0)).toBe(0);
  });
});
