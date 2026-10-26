import { asc, eq, inArray } from "drizzle-orm";
import { fromNodeHeaders } from "better-auth/node";
import { isLevelUnlocked } from "../../../lib/game/unlock";
import { levels, userProgress } from "../../../lib/db/schema";
import { getAuth } from "../../utils/auth";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const allLevels = await db
    .select()
    .from(levels)
    .where(eq(levels.hidden, false))
    .orderBy(asc(levels.order));

  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(event.node.req.headers),
  });
  const userId = session?.user?.id;

  if (!userId) {
    return allLevels.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      order: l.order,
    }));
  }

  const progress = allLevels.length
    ? await db
        .select()
        .from(userProgress)
        .where(
          inArray(
            userProgress.levelId,
            allLevels.map((l) => l.id),
          ),
        )
    : [];

  const byUser = progress.filter((p) => p.userId === userId);
  const progressByLevelId = new Map(byUser.map((p) => [p.levelId, p]));
  const progressByOrder = new Map<number, { stars: number }>();
  for (const l of allLevels) {
    const p = progressByLevelId.get(l.id);
    if (p) progressByOrder.set(l.order, { stars: p.stars });
  }

  return allLevels.map((l) => {
    const p = progressByLevelId.get(l.id);
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      order: l.order,
      stars: p?.stars ?? 0,
      unlocked: isLevelUnlocked(l.order, progressByOrder),
    };
  });
});
