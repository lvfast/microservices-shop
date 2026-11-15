import { describe, expect, it } from "vitest";
import { backofficeAccess, rolesFromAccessToken } from "./access";

describe("backoffice access", () => {
  it("denies visitors and customers", () => {
    expect(backofficeAccess(null)).toBe(401);
    expect(backofficeAccess({ user: { roles: ["shop-customer"] } })).toBe(403);
  });

  it("allows Keycloak admins", () => {
    const payload = Buffer.from(JSON.stringify({ realm_access: { roles: ["shop-admin"] } })).toString("base64url");
    const roles = rolesFromAccessToken(`header.${payload}.signature`);
    expect(backofficeAccess({ user: { roles } })).toBeNull();
  });
});
