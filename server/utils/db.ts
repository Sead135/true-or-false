import { createDb, type Db } from "../../lib/db";

let cached: Db | null = null;
let cachedUrl = "";

export function getDb() {
  const config = useRuntimeConfig();
  if (!config.databaseUrl) {
    throw createError({ statusCode: 500, message: "DATABASE_URL missing" });
  }
  if (!cached || cachedUrl !== config.databaseUrl) {
    cached = createDb(config.databaseUrl);
    cachedUrl = config.databaseUrl;
  }
  return cached;
}
