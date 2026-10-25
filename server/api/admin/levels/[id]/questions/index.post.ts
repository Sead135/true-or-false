import { z } from "zod";
import { questions } from "../../../../../../lib/db/schema";
import { getDb } from "../../../../../utils/db";
import { requireAdmin } from "../../../../../utils/requireAdmin";

const bodySchema = z.object({
  text: z.string().min(1),
  isTrue: z.boolean(),
  explanation: z.string().default(""),
  order: z.number().int().positive(),
});

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const levelId = getRouterParam(event, "id");
  if (!levelId) throw createError({ statusCode: 400, message: "Missing id" });

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) throw createError({ statusCode: 400, message: "Invalid body" });

  const db = getDb();
  const [row] = await db
    .insert(questions)
    .values({ ...parsed.data, levelId })
    .returning();
  return row;
});
