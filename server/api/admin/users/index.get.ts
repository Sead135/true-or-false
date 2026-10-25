import { ilike, or, asc } from "drizzle-orm";
import { user } from "../../../../lib/db/auth-schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const q = getQuery(event).q;
  const db = getDb();

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(
      typeof q === "string" && q.trim()
        ? or(ilike(user.name, `%${q.trim()}%`), ilike(user.email, `%${q.trim()}%`))
        : undefined,
    )
    .orderBy(asc(user.createdAt));

  return rows;
});
