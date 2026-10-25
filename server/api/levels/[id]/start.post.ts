import { eq } from "drizzle-orm";
import { levelAttempts, levels } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireUser } from "../../../utils/requireUser";
import { randomUUID } from "node:crypto";

const TTL_MS = 2 * 60 * 60 * 1000;

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const levelId = getRouterParam(event, "id");
  if (!levelId) {
    throw createError({ statusCode: 400, message: "Missing id" });
  }

  const db = getDb();
  const [level] = await db.select().from(levels).where(eq(levels.id, levelId)).limit(1);
  if (!level || level.hidden) {
    throw createError({ statusCode: 404, message: "Level not found" });
  }

  const id = randomUUID();
  const now = new Date();
  await db.insert(levelAttempts).values({
    id,
    userId: user.id,
    levelId,
    expiresAt: new Date(now.getTime() + TTL_MS),
  });

  return { attemptId: id };
});
