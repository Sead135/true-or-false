import { asc, eq, ilike } from "drizzle-orm";
import { levels, questions } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const q = getQuery(event).q;
  const db = getDb();

  const rows = await db
    .select({
      id: questions.id,
      text: questions.text,
      isTrue: questions.isTrue,
      order: questions.order,
      hidden: questions.hidden,
      levelId: questions.levelId,
      levelTitle: levels.title,
      explanation: questions.explanation,
    })
    .from(questions)
    .innerJoin(levels, eq(levels.id, questions.levelId))
    .where(typeof q === "string" && q.trim() ? ilike(questions.text, `%${q.trim()}%`) : undefined)
    .orderBy(asc(levels.order), asc(questions.order));

  return rows;
});
