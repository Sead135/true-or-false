import { asc, eq } from "drizzle-orm";
import { questions } from "../../../../../../lib/db/schema";
import { getDb } from "../../../../../utils/db";
import { requireAdmin } from "../../../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const levelId = getRouterParam(event, "id");
  if (!levelId) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  return db
    .select()
    .from(questions)
    .where(eq(questions.levelId, levelId))
    .orderBy(asc(questions.order));
});
