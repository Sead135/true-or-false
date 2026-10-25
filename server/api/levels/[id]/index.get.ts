import { and, asc, eq } from "drizzle-orm";
import { levels, questions } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [level] = await db.select().from(levels).where(eq(levels.id, id)).limit(1);
  if (!level || level.hidden) {
    throw createError({ statusCode: 404, message: "Level not found" });
  }

  const qs = await db
    .select({
      id: questions.id,
      text: questions.text,
      order: questions.order,
      isTrue: questions.isTrue,
      explanation: questions.explanation,
    })
    .from(questions)
    .where(and(eq(questions.levelId, id), eq(questions.hidden, false)))
    .orderBy(asc(questions.order));

  return {
    id: level.id,
    slug: level.slug,
    title: level.title,
    introMessage: level.introMessage,
    order: level.order,
    questions: qs,
  };
});
