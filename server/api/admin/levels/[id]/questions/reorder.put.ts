import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { questions } from "../../../../../../lib/db/schema";
import { getDb } from "../../../../../utils/db";
import { requireAdmin } from "../../../../../utils/requireAdmin";

const bodySchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const levelId = getRouterParam(event, "id");
  if (!levelId) throw createError({ statusCode: 400, message: "Missing id" });

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const existing = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.levelId, levelId));

  const existingIds = new Set(existing.map((q) => q.id));
  if (
    parsed.data.orderedIds.length !== existingIds.size ||
    parsed.data.orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw createError({ statusCode: 400, message: "orderedIds mismatch" });
  }

  const now = new Date();
  for (let i = 0; i < parsed.data.orderedIds.length; i++) {
    const qid = parsed.data.orderedIds[i]!;
    await db
      .update(questions)
      .set({ order: i + 1, updatedAt: now })
      .where(eq(questions.id, qid));
  }

  return db.select().from(questions).where(inArray(questions.id, parsed.data.orderedIds));
});
