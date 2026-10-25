import { eq } from "drizzle-orm";
import { z } from "zod";
import { levels } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

const bodySchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  introMessage: z.string().min(1).optional(),
  order: z.number().int().positive().optional(),
  hidden: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [row] = await db
    .update(levels)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(levels.id, id))
    .returning();
  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return row;
});
