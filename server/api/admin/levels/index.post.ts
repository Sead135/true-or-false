import { z } from "zod";
import { levels } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

const bodySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  introMessage: z.string().min(1),
  order: z.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [row] = await db.insert(levels).values(parsed.data).returning();
  return row;
});
