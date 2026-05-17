import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { env } from "@/data/env/server";
import { verifyPassword } from "@/lib/auth/password";
import { loadUserAuthContext } from "@/lib/auth/session-context";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const rows = await db
          .select({
            id: UserTable.id,
            email: UserTable.email,
            name: UserTable.name,
            passwordHash: UserTable.passwordHash,
            status: UserTable.status,
          })
          .from(UserTable)
          .where(eq(UserTable.email, email))
          .limit(1);

        const user = rows[0];
        if (!user?.passwordHash || user.status !== "active") return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      const userId = user?.id ?? (typeof token.sub === "string" ? token.sub : null);

      if (userId && (user || !token.roles)) {
        const context = await loadUserAuthContext(userId);
        token.sub = userId;
        token.roles = context.roles;
        token.primaryRole = context.primaryRole;
        token.agencyId = context.agencyId;
      }

      return token;
    },
  },
  secret: env.AUTH_SECRET,
});
