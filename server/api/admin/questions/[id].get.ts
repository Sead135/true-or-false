import { eq } from "drizzle-orm";
import { levels, questions } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [row] = await db
    .select({
      id: questions.id,
      text: questions.text,
      isTrue: questions.isTrue,
      explanation: questions.explanation,
      order: questions.order,
      hidden: questions.hidden,
      levelId: questions.levelId,
      levelTitle: levels.title,
    })
    .from(questions)
    .innerJoin(levels, eq(levels.id, questions.levelId))
    .where(eq(questions.id, id))
    .limit(1);

  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return row;
});
