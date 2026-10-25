import { sql } from "drizzle-orm";
import { createDb } from "../../lib/db";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  if (!config.databaseUrl) {
    throw createError({ statusCode: 500, statusMessage: "DATABASE_URL missing" });
  }
  const db = createDb(config.databaseUrl);
  await db.execute(sql`select 1`);
  return { ok: true };
});
