import { eq } from "drizzle-orm";
import type { Db } from "../db";
import { userAchievements, userStats } from "../db/schema";
import { XP } from "../xp";
import { findNewlyUnlocked, type UserStatsSnapshot } from "./evaluate";
import type { AchievementDef } from "./catalog";

export type UnlockedAchievementPayload = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
};

function emptyStats(userId: string) {
  return {
    userId,
    xp: 0,
    roundsCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    perfectRounds: 0,
    falseIdentified: 0,
    trueMistakes: 0,
    updatedAt: new Date(),
  };
}

export async function ensureUserStats(db: Db, userId: string) {
  const [row] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  if (row) {
    return row;
  }
  await db.insert(userStats).values(emptyStats(userId)).onConflictDoNothing();
  const [again] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return again || emptyStats(userId);
}

function toSnapshot(row: {
  roundsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  bestStreak: number;
  perfectRounds: number;
  falseIdentified: number;
  trueMistakes: number;
}): UserStatsSnapshot {
  return {
    roundsCompleted: row.roundsCompleted,
    questionsAnswered: row.questionsAnswered,
    correctAnswers: row.correctAnswers,
    bestStreak: row.bestStreak,
    perfectRounds: row.perfectRounds,
    falseIdentified: row.falseIdentified,
    trueMistakes: row.trueMistakes,
  };
}

async function unlockNew(
  db: Db,
  userId: string,
  stats: UserStatsSnapshot,
): Promise<{ unlocked: UnlockedAchievementPayload[]; xpFromAchievements: number }> {
  const existing = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const already = new Set(existing.map((e) => e.achievementId));
  const newly = findNewlyUnlocked(stats, already);
  if (!newly.length) {
    return { unlocked: [], xpFromAchievements: 0 };
  }

  const now = new Date();
  await db
    .insert(userAchievements)
    .values(newly.map((def) => ({ userId, achievementId: def.id, unlockedAt: now })))
    .onConflictDoNothing();

  const after = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const afterSet = new Set(after.map((e) => e.achievementId));
  const unlockedDefs = newly.filter((def) => afterSet.has(def.id) && !already.has(def.id));
  const xpFromAchievements = unlockedDefs.reduce((sum, def) => sum + def.xpReward, 0);

  return {
    unlocked: unlockedDefs.map(payload),
    xpFromAchievements,
  };
}

function payload(def: AchievementDef): UnlockedAchievementPayload {
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    xpReward: def.xpReward,
  };
}

export type RoundAnswerInput = {
  correct: boolean;
  isTrue: boolean;
  answer: boolean;
};

export async function applyRoundRewards(
  db: Db,
  input: { userId: string; answers: RoundAnswerInput[]; correct: number; total: number },
) {
  const row = await ensureUserStats(db, input.userId);
  const now = new Date();

  let currentStreak = row.currentStreak;
  let bestStreak = row.bestStreak;
  let correctAnswers = row.correctAnswers;
  let falseIdentified = row.falseIdentified;
  let trueMistakes = row.trueMistakes;
  let xpGain = 0;

  for (const a of input.answers) {
    if (a.correct) {
      correctAnswers += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
      xpGain += XP.correctAnswer;
      if (!a.isTrue && a.answer === false) falseIdentified += 1;
    } else {
      currentStreak = 0;
      if (a.isTrue && a.answer === false) trueMistakes += 1;
    }
  }

  const perfect = input.total > 0 && input.correct === input.total;
  xpGain += XP.roundComplete;
  if (perfect) xpGain += XP.perfectRound;

  const next = {
    xp: row.xp + xpGain,
    questionsAnswered: row.questionsAnswered + input.answers.length,
    correctAnswers,
    currentStreak,
    bestStreak,
    falseIdentified,
    trueMistakes,
    roundsCompleted: row.roundsCompleted + 1,
    perfectRounds: row.perfectRounds + (perfect ? 1 : 0),
    updatedAt: now,
  };

  await db.update(userStats).set(next).where(eq(userStats.userId, input.userId));

  const snap = toSnapshot({ ...row, ...next });
  const { unlocked, xpFromAchievements } = await unlockNew(db, input.userId, snap);

  if (xpFromAchievements > 0) {
    await db
      .update(userStats)
      .set({ xp: next.xp + xpFromAchievements, updatedAt: new Date() })
      .where(eq(userStats.userId, input.userId));
  }

  return {
    xpGained: xpGain + xpFromAchievements,
    unlockedAchievements: unlocked,
  };
}
