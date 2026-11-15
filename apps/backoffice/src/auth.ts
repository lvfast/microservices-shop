import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { rolesFromAccessToken } from "./lib/access";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account }) {
      if (account?.access_token) token.roles = rolesFromAccessToken(account.access_token);
      return token;
    },
    session({ session, token }) {
      session.user.roles = Array.isArray(token.roles) ? token.roles as string[] : [];
      return session;
    },
  },
});
