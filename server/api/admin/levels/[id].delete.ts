import { eq } from "drizzle-orm";
import { levels } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [row] = await db
    .update(levels)
    .set({ hidden: true, updatedAt: new Date() })
    .where(eq(levels.id, id))
    .returning({ id: levels.id });

  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return { ok: true, softDeleted: true };
});
