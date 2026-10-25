import { and, count, desc, gte, lte, sql } from "drizzle-orm";
import { resolveStatsRange } from "../../../../lib/admin/statsRange";
import { userAchievements } from "../../../../lib/db/schema";
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
  const conds = [lte(userAchievements.unlockedAt, range.to)];
  if (range.from) conds.push(gte(userAchievements.unlockedAt, range.from));

  const [totalRow] = await db
    .select({ c: count() })
    .from(userAchievements)
    .where(and(...conds));

  const perDay = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${userAchievements.unlockedAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(userAchievements)
    .where(and(...conds))
    .groupBy(sql`date_trunc('day', ${userAchievements.unlockedAt})`)
    .orderBy(sql`date_trunc('day', ${userAchievements.unlockedAt})`);

  const byAchievement = await db
    .select({
      achievementId: userAchievements.achievementId,
      count: count(),
    })
    .from(userAchievements)
    .where(and(...conds))
    .groupBy(userAchievements.achievementId)
    .orderBy(desc(count()))
    .limit(20);

  return {
    from: range.from?.toISOString() ?? null,
    to: range.to.toISOString(),
    total: Number(totalRow?.c ?? 0),
    perDay: perDay.map((r) => ({ date: r.date, count: Number(r.count) })),
    byAchievement: byAchievement.map((r) => ({
      achievementId: r.achievementId,
      count: Number(r.count),
    })),
  };
});
