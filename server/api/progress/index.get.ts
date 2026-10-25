import { eq } from "drizzle-orm";
import { userProgress } from "../../../lib/db/schema";
import { getDb } from "../../utils/db";
import { requireUser } from "../../utils/requireUser";

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const db = getDb();
  const rows = await db.select().from(userProgress).where(eq(userProgress.userId, user.id));
  return {
    progress: rows.map((r) => ({
      levelId: r.levelId,
      stars: r.stars,
      bestCorrect: r.bestCorrect,
      bestTotal: r.bestTotal,
      completedAt: r.completedAt?.toISOString() ?? null,
      updatedAt: r.updatedAt?.toISOString() ?? null,
    })),
  };
});
