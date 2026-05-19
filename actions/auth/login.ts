"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserRoleTable, UserTable } from "@/drizzle/schema";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import type { ScopedRole } from "@/lib/auth/roles";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

async function resolvePostLoginRedirect(email: string): Promise<string> {
  try {
    const roleRows = await db
      .select({
        role: UserRoleTable.role,
        agencyId: UserRoleTable.agencyId,
        onboardingCompletedAt: AgencyTable.onboardingCompletedAt,
      })
      .from(UserTable)
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .leftJoin(AgencyTable, eq(AgencyTable.id, UserRoleTable.agencyId))
      .where(eq(UserTable.email, email));

    const roles: ScopedRole[] = roleRows.map((row) => ({
      role: row.role,
      agencyId: row.agencyId,
    }));

    const incompleteOnboarding = roleRows.find(
      (row) =>
        (row.role === "agency_owner" || row.role === "agency_admin") &&
        row.onboardingCompletedAt === null,
    );
    if (incompleteOnboarding) {
      return "/onboarding";
    }

    return getPostLoginRedirect(roles);
  } catch {
    return "/dashboard";
  }
}

export async function loginAction(
  input: unknown,
  callbackUrl?: string,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid login details.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Onboarding check overrides callbackUrl for incomplete agency owners/admins
  const redirectTo = await resolvePostLoginRedirect(email);

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Invalid email or password.",
      };
    }
    console.error("Login failed", error);
    return {
      status: "error",
      message: "Unable to sign in. Please try again.",
    };
  }

  return { status: "idle" };
}
