import { ACHIEVEMENTS, META_IDS, type AchievementDef } from "./catalog";

export type UserStatsSnapshot = {
  roundsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  bestStreak: number;
  perfectRounds: number;
  falseIdentified: number;
  trueMistakes: number;
};

export function metricValue(
  def: AchievementDef,
  stats: UserStatsSnapshot,
  unlockedIds: Set<string>,
): number {
  switch (def.metric) {
    case "roundsCompleted":
      return stats.roundsCompleted;
    case "questionsAnswered":
      return stats.questionsAnswered;
    case "correctAnswers":
      return stats.correctAnswers;
    case "bestStreak":
      return stats.bestStreak;
    case "perfectRounds":
      return stats.perfectRounds;
    case "falseIdentified":
      return stats.falseIdentified;
    case "trueMistakes":
      return stats.trueMistakes;
    case "achievementCount":
      return [...unlockedIds].filter((id) => !META_IDS.has(id)).length;
    case "allOthers":
      return ACHIEVEMENTS.filter((a) => a.id !== "legend").every((a) => unlockedIds.has(a.id))
        ? 1
        : 0;
    default:
      return 0;
  }
}

export function isUnlocked(
  def: AchievementDef,
  stats: UserStatsSnapshot,
  unlockedIds: Set<string>,
): boolean {
  return metricValue(def, stats, unlockedIds) >= def.target;
}

export function findNewlyUnlocked(
  stats: UserStatsSnapshot,
  alreadyUnlocked: Iterable<string>,
): AchievementDef[] {
  const unlocked = new Set(alreadyUnlocked);
  const newly: AchievementDef[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const def of ACHIEVEMENTS) {
      if (unlocked.has(def.id)) continue;
      if (!isUnlocked(def, stats, unlocked)) continue;
      unlocked.add(def.id);
      newly.push(def);
      changed = true;
    }
  }
  return newly;
}

export function accuracyPercent(correct: number, answered: number): number {
  if (answered <= 0) {
    return 0;
  }
  return Math.round((correct / answered) * 1000) / 10;
}

export type AchievementProgressView = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementDef["category"];
  order: number;
  xpReward: number;
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export function buildAchievementViews(
  stats: UserStatsSnapshot,
  unlocked: { achievementId: string; unlockedAt: Date }[],
): AchievementProgressView[] {
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));
  const unlockedIds = new Set(unlockedMap.keys());
  return ACHIEVEMENTS.map((def) => {
    const current = Math.min(metricValue(def, stats, unlockedIds), def.target);
    const at = unlockedMap.get(def.id);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      order: def.order,
      xpReward: def.xpReward,
      target: def.target,
      current: unlockedMap.has(def.id) ? def.target : current,
      unlocked: unlockedMap.has(def.id),
      unlockedAt: at ? at.toISOString() : null,
    };
  });
}
