import { eq } from "drizzle-orm";
import { z } from "zod";
import { canAssignRole, canManageUser } from "../../../../lib/admin/roles";
import { user } from "../../../../lib/db/auth-schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [target] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (!target) throw createError({ statusCode: 404, message: "Not found" });
  if (!canManageUser(actor, target)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  if (parsed.data.role !== undefined && !canAssignRole(actor.role, parsed.data.role)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const [row] = await db
    .update(user)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

  return row;
});
