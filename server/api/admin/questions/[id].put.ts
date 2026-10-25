import { eq } from "drizzle-orm";
import { z } from "zod";
import { questions } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

const bodySchema = z.object({
  text: z.string().min(1).optional(),
  isTrue: z.boolean().optional(),
  explanation: z.string().optional(),
  order: z.number().int().positive().optional(),
  hidden: z.boolean().optional(),
  levelId: z.string().uuid().optional(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing id" });

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [row] = await db
    .update(questions)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(questions.id, id))
    .returning();
  if (!row) throw createError({ statusCode: 404, message: "Not found" });
  return row;
});
