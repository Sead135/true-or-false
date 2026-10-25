export type StatsPreset = "7d" | "30d" | "90d" | "all" | "custom";

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function endOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

function parseDay(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) throw new Error("Invalid range");
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(Date.UTC(y, mo, day));
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== mo || d.getUTCDate() !== day) {
    throw new Error("Invalid range");
  }
  return d;
}

export function resolveStatsRange(input: {
  preset?: string;
  from?: string;
  to?: string;
  now?: Date;
}): { from: Date | null; to: Date } {
  const now = input.now ?? new Date();
  const preset = (input.preset || "7d") as StatsPreset;

  if (preset === "all") {
    return { from: null, to: now };
  }

  if (preset === "custom") {
    if (!input.from || !input.to) throw new Error("Invalid range");
    const from = startOfUtcDay(parseDay(input.from));
    const to = endOfUtcDay(parseDay(input.to));
    if (from > to) throw new Error("Invalid range");
    return { from, to };
  }

  const days = preset === "30d" ? 30 : preset === "90d" ? 90 : 7;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to: now };
}
