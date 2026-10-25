import { and, count, gte, lte, sql } from "drizzle-orm";
import { resolveStatsRange } from "../../../../lib/admin/statsRange";
import { levelAttemptAnswers } from "../../../../lib/db/schema";
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
  const conds = [lte(levelAttemptAnswers.createdAt, range.to)];
  if (range.from) conds.push(gte(levelAttemptAnswers.createdAt, range.from));

  const [totalRow] = await db
    .select({ c: count() })
    .from(levelAttemptAnswers)
    .where(and(...conds));

  const perDay = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${levelAttemptAnswers.createdAt}), 'YYYY-MM-DD')`,
      count: count(),
    })
    .from(levelAttemptAnswers)
    .where(and(...conds))
    .groupBy(sql`date_trunc('day', ${levelAttemptAnswers.createdAt})`)
    .orderBy(sql`date_trunc('day', ${levelAttemptAnswers.createdAt})`);

  return {
    from: range.from?.toISOString() ?? null,
    to: range.to.toISOString(),
    total: Number(totalRow?.c ?? 0),
    perDay: perDay.map((r) => ({ date: r.date, count: Number(r.count) })),
  };
});
