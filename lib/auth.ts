import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, normalizeDatabaseUrl, schema } from "./db";

export function createAuth(env: {
  databaseUrl: string;
  secret: string;
  baseURL: string;
  adminEmail: string;
}) {
  const db = createDb(normalizeDatabaseUrl(env.databaseUrl));
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    secret: env.secret,
    baseURL: env.baseURL,
    trustedOrigins: [env.baseURL, "http://localhost:3000", "http://127.0.0.1:3000"],
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
