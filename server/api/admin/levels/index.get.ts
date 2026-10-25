import { asc } from "drizzle-orm";
import { levels } from "../../../../lib/db/schema";
import { getDb } from "../../../utils/db";
import { requireAdmin } from "../../../utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDb();
  return db.select().from(levels).orderBy(asc(levels.order));
});
