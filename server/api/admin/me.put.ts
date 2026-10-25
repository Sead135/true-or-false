import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../../../lib/db/auth-schema";
import { getDb } from "../../utils/db";
import { requireAdmin } from "../../utils/requireAdmin";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  image: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event);
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [row] = await db
    .update(user)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(user.id, actor.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    });

  return row;
});
