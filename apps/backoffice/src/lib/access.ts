export type BackofficeSession = { user?: { roles?: string[] } } | null;

export function rolesFromAccessToken(accessToken: string): string[] {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"));
    const roles = payload?.realm_access?.roles;
    return Array.isArray(roles) ? roles.filter((role): role is string => typeof role === "string") : [];
  } catch {
    return [];
  }
}

export function backofficeAccess(session: BackofficeSession): 401 | 403 | null {
  if (!session?.user) return 401;
  return session.user.roles?.includes("shop-admin") ? null : 403;
}
