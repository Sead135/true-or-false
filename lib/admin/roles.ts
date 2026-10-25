export type AppRole = "owner" | "admin" | "user";

export function isElevated(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canManageUser(
  actor: { id: string; role: string },
  target: { id: string; role: string },
): boolean {
  if (actor.id === target.id) {
    return false;
  }
  if (target.role === "owner") {
    return false;
  }
  if (actor.role === "owner") {
    return true;
  }
  if (actor.role === "admin" && target.role === "user") {
    return true;
  }
  return false;
}

export function canAssignRole(actorRole: string, nextRole: string): boolean {
  if (nextRole === "owner") {
    return false;
  }
  if (actorRole !== "owner") {
    return false;
  }
  return nextRole === "admin" || nextRole === "user";
}
