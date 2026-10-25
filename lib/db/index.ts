import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "./auth-schema";
import * as gameSchema from "./schema";

export const schema = { ...authSchema, ...gameSchema };

export function normalizeDatabaseUrl(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

export function createDb(databaseUrl: string) {
  const sql = neon(normalizeDatabaseUrl(databaseUrl));
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;
