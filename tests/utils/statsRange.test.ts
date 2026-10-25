import { describe, expect, test } from "bun:test";
import { resolveStatsRange } from "../../lib/admin/statsRange";

const now = new Date("2026-10-25T12:00:00.000Z");

describe("resolveStatsRange", () => {
  test("7d preset", () => {
    const r = resolveStatsRange({ preset: "7d", now });
    expect(r.to.toISOString()).toBe(now.toISOString());
    expect(r.from!.toISOString()).toBe("2026-10-18T12:00:00.000Z");
  });
  test("all", () => {
    const r = resolveStatsRange({ preset: "all", now });
    expect(r.from).toBeNull();
  });
  test("custom", () => {
    const r = resolveStatsRange({
      preset: "custom",
      from: "2026-10-01",
      to: "2026-10-10",
      now,
    });
    expect(r.from!.toISOString().startsWith("2026-10-01")).toBe(true);
    expect(r.to.toISOString().startsWith("2026-10-10")).toBe(true);
  });
});
