"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

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

  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
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
