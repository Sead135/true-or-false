import { eq } from "drizzle-orm";
import { user } from "../../../../lib/db/auth-schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const db = getDb();
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return row;
});
