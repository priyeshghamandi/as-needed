"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { and, eq, inArray } from "drizzle-orm";
import { signIn } from "@/auth";
import { db } from "@/drizzle/db";
import { AgencyTable, UserRoleTable, UserTable } from "@/drizzle/schema";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

async function resolvePostLoginRedirect(email: string): Promise<string> {
  try {
    const rows = await db
      .select({ onboardingCompletedAt: AgencyTable.onboardingCompletedAt })
      .from(UserTable)
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(AgencyTable, eq(AgencyTable.id, UserRoleTable.agencyId))
      .where(
        and(
          eq(UserTable.email, email),
          inArray(UserRoleTable.role, ["agency_owner", "agency_admin"]),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (row && row.onboardingCompletedAt === null) {
      return "/onboarding";
    }
  } catch {
    // DB error — fall through to default
  }
  return "/dashboard";
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
