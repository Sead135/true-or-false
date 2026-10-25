import { and, count, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { resolveStatsRange } from "../../../../lib/admin/statsRange";
import {
  levelAttemptAnswers,
  levelAttempts,
  levels,
  questions,
  userAchievements,
} from "../../../../lib/db/schema";
import { user } from "../../../../lib/db/auth-schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const q = getQuery(event);
  let range: { from: Date | null; to: Date };
  try {
    range = resolveStatsRange({
      preset: typeof q.preset === "string" ? q.preset : "7d",
      from: typeof q.from === "string" ? q.from : undefined,
      to: typeof q.to === "string" ? q.to : undefined,
    });
  } catch {
    throw createError({ statusCode: 400, message: "Invalid range" });
  }

  const db = getDb();

  const [usersRow] = await db.select({ c: count() }).from(user);
  const [questionsRow] = await db.select({ c: count() }).from(questions);
  const [questionsHiddenRow] = await db
    .select({ c: count() })
    .from(questions)
    .where(eq(questions.hidden, true));

  const answerConds = [lte(levelAttemptAnswers.createdAt, range.to)];
  if (range.from) answerConds.push(gte(levelAttemptAnswers.createdAt, range.from));

  const [answersRow] = await db
    .select({ c: count() })
    .from(levelAttemptAnswers)
    .where(and(...answerConds));

  const achConds = [lte(userAchievements.unlockedAt, range.to)];
  if (range.from) achConds.push(gte(userAchievements.unlockedAt, range.from));

  const [achRow] = await db
    .select({ c: count() })
    .from(userAchievements)
    .where(and(...achConds));

  const answersPerDay = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${levelAttemptAnswers.createdAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(levelAttemptAnswers)
    .where(and(...answerConds))
    .groupBy(sql`date_trunc('day', ${levelAttemptAnswers.createdAt})`)
    .orderBy(sql`date_trunc('day', ${levelAttemptAnswers.createdAt})`);

  const finishConds = [
    isNotNull(levelAttempts.finishedAt),
    lte(levelAttempts.finishedAt, range.to),
  ];
  if (range.from) finishConds.push(gte(levelAttempts.finishedAt, range.from));

  const topLevels = await db
    .select({
      levelId: levelAttempts.levelId,
      title: levels.title,
      completions: count(),
    })
    .from(levelAttempts)
    .innerJoin(levels, eq(levels.id, levelAttempts.levelId))
    .where(and(...finishConds))
    .groupBy(levelAttempts.levelId, levels.title)
    .orderBy(sql`count(*) desc`)
    .limit(5);

  return {
    usersTotal: Number(usersRow?.c ?? 0),
    questionsTotal: Number(questionsRow?.c ?? 0),
    questionsHidden: Number(questionsHiddenRow?.c ?? 0),
    answersInPeriod: Number(answersRow?.c ?? 0),
    achievementsInPeriod: Number(achRow?.c ?? 0),
    answersPerDay: answersPerDay.map((r) => ({ date: r.date, count: Number(r.count) })),
    topLevels: topLevels.map((r) => ({
      levelId: r.levelId,
      title: r.title,
      completions: Number(r.completions),
    })),
  };
});
