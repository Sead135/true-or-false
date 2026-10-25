import { eq } from "drizzle-orm";
import { createAuth } from "../lib/auth";
import { createDb } from "../lib/db";
import { user } from "../lib/db/auth-schema";

const databaseUrl = process.env.DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const baseURL = process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!databaseUrl || !secret || !adminEmail || !adminPassword) {
  throw new Error("Missing DATABASE_URL / BETTER_AUTH_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD");
}

const db = createDb(databaseUrl);
const auth = createAuth({ databaseUrl, secret, baseURL, adminEmail });

const existing = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);

if (existing[0]) {
  await db.update(user).set({ role: "owner" }).where(eq(user.email, adminEmail));
  console.log("Owner role ensured for", adminEmail);
} else {
  const res = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      password: adminPassword,
      name: "Admin",
    },
  });
  if (!res.user) throw new Error("Failed to create admin");
  await db.update(user).set({ role: "owner" }).where(eq(user.email, adminEmail));
  console.log("Owner created", adminEmail);
}
