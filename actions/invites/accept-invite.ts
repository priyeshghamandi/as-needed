"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getPostLoginRedirect } from "@/lib/auth/redirects";
import { loadUserAuthContext } from "@/lib/auth/session-context";
import { acceptInviteSchema } from "@/lib/validations/auth";
import { InviteError, acceptUserInvite } from "@/lib/services/invites";

export type AcceptInviteState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function acceptInviteAction(
  input: unknown,
): Promise<AcceptInviteState> {
  const parsed = acceptInviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid invite details.",
    };
  }

  try {
    const result = await acceptUserInvite(parsed.data);
    const context = await loadUserAuthContext(result.user.id);
    const redirectTo = getPostLoginRedirect(context.roles);

    await signIn("credentials", {
      email: result.email,
      password: result.password,
      redirectTo,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof InviteError) {
      return { status: "error", message: error.message };
    }
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created but sign-in failed. Please sign in.",
      };
    }
    console.error("Accept invite failed", error);
    return {
      status: "error",
      message: "Unable to accept invite. Please try again.",
    };
  }

  return { status: "idle" };
}
