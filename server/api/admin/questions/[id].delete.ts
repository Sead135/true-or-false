import { eq } from "drizzle-orm";
import { questions } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [row] = await db
    .update(questions)
    .set({ hidden: true, updatedAt: new Date() })
    .where(eq(questions.id, id))
    .returning({ id: questions.id });

  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return { ok: true, softDeleted: true };
});
