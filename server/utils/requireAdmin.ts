import { isElevated } from "../../lib/admin/roles";
import { requireUser } from "./requireUser";

export async function requireAdmin(event: Parameters<typeof requireUser>[0]) {
  const user = await requireUser(event);
  if (!isElevated(user.role)) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  return user;
}
