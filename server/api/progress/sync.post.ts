import { eq } from "drizzle-orm";
import { z } from "zod";
import { mergeProgress, type ProgressRow } from "../../../app/utils/mergeProgress";
import { userProgress } from "../../../lib/db/schema";
import { getDb } from "../../utils/db";
import { requireUser } from "../../utils/requireUser";

const rowSchema = z.object({
  levelId: z.string().uuid(),
  stars: z.number().int().min(0).max(3),
  bestCorrect: z.number().int().min(0),
  bestTotal: z.number().int().min(0),
  completedAt: z.string().nullable(),
  updatedAt: z.string().nullable().optional(),
});

const bodySchema = z.object({
  progress: z.array(rowSchema),
});

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Invalid body" });
  }

  const db = getDb();
  const remoteRows = await db.select().from(userProgress).where(eq(userProgress.userId, user.id));
  const remote: ProgressRow[] = remoteRows.map((r) => ({
    levelId: r.levelId,
    stars: r.stars,
    bestCorrect: r.bestCorrect,
    bestTotal: r.bestTotal,
    completedAt: r.completedAt?.toISOString() ?? null,
    updatedAt: r.updatedAt?.toISOString() ?? null,
  }));

  const merged = mergeProgress(parsed.data.progress, remote);

  if (!parsed.data.progress.length) {
    return { progress: remote };
  }

  const now = new Date();
  for (const row of merged) {
    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        levelId: row.levelId,
        stars: row.stars,
        bestCorrect: row.bestCorrect,
        bestTotal: row.bestTotal,
        completedAt: row.completedAt ? new Date(row.completedAt) : now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.levelId],
        set: {
          stars: row.stars,
          bestCorrect: row.bestCorrect,
          bestTotal: row.bestTotal,
          completedAt: row.completedAt ? new Date(row.completedAt) : now,
          updatedAt: now,
        },
      });
  }

  return { progress: merged };
});
