import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { createDb, normalizeDatabaseUrl, schema } from "./db";
import { levelAttempts, userAchievements, userProgress, userStats } from "./db/schema";

function normalizeBaseURL(url: string) {
  return url
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");
}

function originFromHost(host: string) {
  const h = host.trim().replace(/\/$/, "");
  if (!h) {
    return null;
  }
  if (h.includes("://")) {
    return normalizeBaseURL(h);
  }
  return `https://${h}`;
}

export function createAuth(env: {
  databaseUrl: string;
  secret: string;
  baseURL: string;
  adminEmail: string;
  trustedOriginsExtra?: string[];
}) {
  const baseURL = normalizeBaseURL(env.baseURL);
  const trusted = new Set<string>([baseURL]);
  for (const raw of env.trustedOriginsExtra || []) {
    const o = originFromHost(raw);
    if (o) {
      trusted.add(o);
    }
  }

  const db = createDb(normalizeDatabaseUrl(env.databaseUrl));

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    secret: env.secret,
    baseURL,
    advanced: {
      trustedProxyHeaders: true,
    },
    trustedOrigins: async (request) => {
      const origins = new Set(trusted);
      const originHeader = request?.headers.get("origin");
      const forwarded =
        request?.headers.get("x-forwarded-host") || request?.headers.get("host") || "";
      const requestHost = forwarded.split(",")[0]?.trim().split(":")[0] || "";

      if (originHeader && requestHost) {
        try {
          const origin = new URL(originHeader).origin;
          const originHost = new URL(origin).hostname;
          if (originHost === requestHost || forwarded.includes(originHost)) {
            origins.add(origin);
          }
        } catch {
          /* ignore */
        }
      }

      return [...origins];
    },
    emailAndPassword: { enabled: true },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60 * 15, max: 10 },
        "/sign-up/email": { window: 60 * 15, max: 10 },
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          required: false,
          input: false,
        },
      },
      deleteUser: {
        enabled: true,
        async afterDelete(user) {
          await db.delete(levelAttempts).where(eq(levelAttempts.userId, user.id));
          await db.delete(userProgress).where(eq(userProgress.userId, user.id));
          await db.delete(userStats).where(eq(userStats.userId, user.id));
          await db.delete(userAchievements).where(eq(userAchievements.userId, user.id));
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          async before(user) {
            if (user.email === env.adminEmail) {
              return { data: { ...user, role: "owner" } };
            }
            return { data: user };
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
