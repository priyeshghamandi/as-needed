import type { NextAuthConfig } from "next-auth";
import type { ScopedRole } from "@/lib/auth/roles";

/**
 * Edge-safe Auth.js config (no DB, argon2, or pg).
 * Used by middleware. Full providers live in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.roles = (token.roles as ScopedRole[] | undefined) ?? [];
        session.user.primaryRole =
          (token.primaryRole as ScopedRole["role"] | null | undefined) ?? null;
        session.user.agencyId =
          (token.agencyId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
