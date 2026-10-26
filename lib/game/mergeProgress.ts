import { computeStars } from "./stars";

export type ProgressRow = {
  levelId: string;
  stars: number;
  bestCorrect: number;
  bestTotal: number;
  completedAt: string | null;
  updatedAt?: string | null;
};

export function sanitizeProgressRow(row: ProgressRow): ProgressRow {
  const bestTotal = Math.max(0, Math.floor(row.bestTotal));
  const bestCorrect = Math.min(Math.max(0, Math.floor(row.bestCorrect)), bestTotal);
  const earned = computeStars(bestCorrect, bestTotal);
  const stars = Math.min(3, Math.max(0, Math.floor(row.stars)), earned);
  return { ...row, bestTotal, bestCorrect, stars };
}

function better(a: ProgressRow, b: ProgressRow): ProgressRow {
  if (a.stars !== b.stars) {
    return a.stars > b.stars ? a : b;
  }
  if (a.bestCorrect !== b.bestCorrect) {
    return a.bestCorrect > b.bestCorrect ? a : b;
  }
  const at = a.updatedAt || a.completedAt || "";
  const bt = b.updatedAt || b.completedAt || "";
  return at >= bt ? a : b;
}

export function mergeProgress(local: ProgressRow[], remote: ProgressRow[]): ProgressRow[] {
  const map = new Map<string, ProgressRow>();
  for (const row of remote) map.set(row.levelId, row);
  for (const row of local) {
    const existing = map.get(row.levelId);
    map.set(row.levelId, existing ? better(row, existing) : row);
  }
  return [...map.values()];
}
