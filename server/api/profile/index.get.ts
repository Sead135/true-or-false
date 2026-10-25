import { eq } from "drizzle-orm";
import { buildAchievementViews, accuracyPercent } from "../../../lib/achievements/evaluate";
import { ensureUserStats } from "../../../lib/achievements/apply";
import { userAchievements } from "../../../lib/db/schema";
import { levelFromXp, levelTitle } from "../../../lib/xp";
import { getDb } from "../../utils/db";
import { requireUser } from "../../utils/requireUser";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = getDb();
  const stats = await ensureUserStats(db, user.id);

  const unlocked = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, user.id));

  const snap = {
    roundsCompleted: stats.roundsCompleted,
    questionsAnswered: stats.questionsAnswered,
    correctAnswers: stats.correctAnswers,
    bestStreak: stats.bestStreak,
    perfectRounds: stats.perfectRounds,
    falseIdentified: stats.falseIdentified,
    trueMistakes: stats.trueMistakes,
  };

  const achievements = buildAchievementViews(snap, unlocked);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const levelInfo = levelFromXp(stats.xp);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
    level: levelInfo.level,
    levelTitle: levelTitle(levelInfo.level),
    xp: levelInfo.xp,
    xpIntoLevel: levelInfo.xpIntoLevel,
    xpForNext: levelInfo.xpForNext,
    xpProgress: levelInfo.progress,
    stats: {
      roundsCompleted: stats.roundsCompleted,
      questionsAnswered: stats.questionsAnswered,
      correctAnswers: stats.correctAnswers,
      accuracy: accuracyPercent(stats.correctAnswers, stats.questionsAnswered),
      bestStreak: stats.bestStreak,
      totalXp: stats.xp,
    },
    achievements: {
      unlocked: unlockedCount,
      total: achievements.length,
      items: achievements,
    },
  };
});
