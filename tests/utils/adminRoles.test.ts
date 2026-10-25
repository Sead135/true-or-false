import { describe, expect, test } from "bun:test";
import { isElevated, canManageUser, canAssignRole } from "../../lib/admin/roles";

describe("isElevated", () => {
  test("owner and admin", () => {
    expect(isElevated("owner")).toBe(true);
    expect(isElevated("admin")).toBe(true);
    expect(isElevated("user")).toBe(false);
  });
});

describe("canManageUser", () => {
  const owner = { id: "o1", role: "owner" };
  const adminA = { id: "a1", role: "admin" };
  const adminB = { id: "a2", role: "admin" };
  const user = { id: "u1", role: "user" };

  test("nobody manages self for delete/edit-guard (returns false for self)", () => {
    expect(canManageUser(owner, owner)).toBe(false);
    expect(canManageUser(adminA, adminA)).toBe(false);
  });
  test("owner manages admin and user", () => {
    expect(canManageUser(owner, adminA)).toBe(true);
    expect(canManageUser(owner, user)).toBe(true);
  });
  test("admin manages user only", () => {
    expect(canManageUser(adminA, user)).toBe(true);
    expect(canManageUser(adminA, adminB)).toBe(false);
    expect(canManageUser(adminA, owner)).toBe(false);
  });
});

describe("canAssignRole", () => {
  test("only owner assigns admin; never owner", () => {
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("owner", "user")).toBe(true);
    expect(canAssignRole("owner", "owner")).toBe(false);
    expect(canAssignRole("admin", "admin")).toBe(false);
    expect(canAssignRole("admin", "user")).toBe(false);
  });
});
