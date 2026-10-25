import type { H3Event } from "h3";
import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "./auth";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string | null;
};

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const auth = getAuth();
  // headers only — toWebRequest() attaches the body stream and locks readBody() on POST
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(event.node.req.headers),
  });
  if (!session?.user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const u = session.user;
  const role = "role" in u && typeof u.role === "string" ? u.role : "user";
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role,
    image: u.image ?? null,
  };
}
