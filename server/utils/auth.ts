import { createAuth, type Auth } from "../../lib/auth";

let cached: Auth | null = null;
let cachedKey = "";

export function getAuth() {
  const config = useRuntimeConfig();
  if (!config.databaseUrl) {
    throw createError({ statusCode: 500, message: "DATABASE_URL missing" });
  }
  if (!config.betterAuthSecret) {
    throw createError({ statusCode: 500, message: "BETTER_AUTH_SECRET missing" });
  }
  const key = `${config.databaseUrl}|${config.betterAuthSecret}|${config.public.appUrl}|${config.adminEmail}`;
  if (!cached || cachedKey !== key) {
    cached = createAuth({
      databaseUrl: config.databaseUrl,
      secret: config.betterAuthSecret,
      baseURL: config.public.appUrl,
      adminEmail: config.adminEmail,
    });
    cachedKey = key;
  }
  return cached;
}
