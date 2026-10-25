import { eq } from "drizzle-orm";
import { canManageUser } from "../../../../lib/admin/roles";
import { user } from "../../../../lib/db/auth-schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [target] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!target) throw createError({ statusCode: 404, message: "Not found" });
  if (!canManageUser(actor, target)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  await db.delete(user).where(eq(user.id, id));
  return { ok: true };
});
