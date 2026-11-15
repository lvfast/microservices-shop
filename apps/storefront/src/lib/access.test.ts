import { describe, expect, it } from "vitest";
import { checkoutAccess, rolesFromAccessToken } from "./access";

describe("checkout access", () => {
  it("rejects anonymous visitors and admins without customer role", () => {
    expect(checkoutAccess(null)).toBe(401);
    expect(checkoutAccess({ user: { roles: ["shop-admin"] } })).toBe(403);
  });

  it("accepts customers whose role came from Keycloak access token", () => {
    const payload = Buffer.from(JSON.stringify({ realm_access: { roles: ["shop-customer"] } })).toString("base64url");
    const roles = rolesFromAccessToken(`header.${payload}.signature`);
    expect(roles).toContain("shop-customer");
    expect(checkoutAccess({ user: { roles } })).toBeNull();
  });
});
