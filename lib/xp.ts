export function xpToReachLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return 50 * (level - 1) * level;
}

export function levelFromXp(xp: number) {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (safe >= xpToReachLevel(level + 1)) level += 1;
  const floor = xpToReachLevel(level);
  const next = xpToReachLevel(level + 1);
  const into = safe - floor;
  const need = next - floor;
  return {
    level,
    xp: safe,
    xpIntoLevel: into,
    xpForNext: need,
    progress: need === 0 ? 1 : into / need,
  };
}

export const LEVEL_TITLES = [
  "Новичок",
  "Любопытный",
  "Ученик",
  "Искатель",
  "Знаток",
  "Эрудит",
  "Мастер",
  "Эксперт",
  "Мудрец",
  "Легенда",
] as const;

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1] || `Уровень ${level}`;
}

export const XP = {
  correctAnswer: 5,
  roundComplete: 20,
  perfectRound: 30,
} as const;
