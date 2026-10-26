import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { applyRoundRewards } from "../../../lib/achievements/apply";
import { answersBodySchema, gradeAnswers } from "../../../lib/game/gradeAnswers";
import { computeStars } from "../../../lib/game/stars";
import { levelAttemptAnswers, levelAttempts, userProgress } from "../../../lib/db/schema";
import { getDb } from "../../utils/db";
import { requireUser } from "../../utils/requireUser";

const bodySchema = z.object({
  attemptId: z.string().uuid(),
  answers: answersBodySchema,
});

export default defineEventHandler(async (event) => {
  const [user, rawBody] = await Promise.all([requireUser(event), readBody(event)]);
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Invalid body" });
  }

  const db = getDb();
  const [attempt] = await db
    .select()
    .from(levelAttempts)
    .where(eq(levelAttempts.id, parsed.data.attemptId))
    .limit(1);

  if (!attempt || attempt.userId !== user.id) {
    throw createError({ statusCode: 403, message: "Invalid attempt" });
  }
  if (attempt.expiresAt.getTime() < Date.now() && !attempt.finishedAt) {
    throw createError({ statusCode: 400, message: "Attempt expired" });
  }

  if (attempt.finishedAt) {
    const stored = await db
      .select()
      .from(levelAttemptAnswers)
      .where(eq(levelAttemptAnswers.attemptId, attempt.id));
    const correct = stored.filter((a) => a.correct).length;
    const total = stored.length;
    const stars = computeStars(correct, total || 1);
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.levelId, attempt.levelId)))
      .limit(1);
    return {
      stars: existing ? Math.max(existing.stars, stars) : stars,
      correct,
      total,
      unlockedAchievements: [],
    };
  }

  const { graded, correct, total, stars } = await gradeAnswers(
    db,
    attempt.levelId,
    parsed.data.answers,
  );

  await db.insert(levelAttemptAnswers).values(
    graded.map((g) => ({
      attemptId: attempt.id,
      questionId: g.questionId,
      answer: g.answer,
      correct: g.correct,
    })),
  );

  const [existing] = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, user.id), eq(userProgress.levelId, attempt.levelId)))
    .limit(1);

  const nextStars = existing ? Math.max(existing.stars, stars) : stars;
  const now = new Date();
  const improved = !existing || stars > existing.stars;
  const bestCorrect = improved ? correct : (existing?.bestCorrect ?? correct);
  const bestTotal = improved ? total : (existing?.bestTotal ?? total);

  await db
    .insert(userProgress)
    .values({
      userId: user.id,
      levelId: attempt.levelId,
      stars: nextStars,
      bestCorrect,
      bestTotal,
      completedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.levelId],
      set: {
        stars: nextStars,
        bestCorrect,
        bestTotal,
        completedAt: now,
        updatedAt: now,
      },
    });

  await db.update(levelAttempts).set({ finishedAt: now }).where(eq(levelAttempts.id, attempt.id));

  let unlockedAchievements: Awaited<ReturnType<typeof applyRoundRewards>>["unlockedAchievements"] =
    [];
  try {
    const rewards = await applyRoundRewards(db, {
      userId: user.id,
      answers: graded,
      correct,
      total,
    });
    unlockedAchievements = rewards.unlockedAchievements;
  } catch (e) {
    console.error("finish rewards failed", e);
  }

  return {
    stars: nextStars,
    correct,
    total,
    unlockedAchievements,
  };
});
