"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { createAgencySignup, DuplicateEmailError } from "@/lib/services/agency-signup";
import {
  agencySignupSchema,
  mapZodErrors,
  type AgencySignupFieldErrors,
  type AgencySignupInput,
} from "@/lib/validations/agency-signup";

export type RegisterAgencyState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: AgencySignupFieldErrors };

export async function registerAgencyAction(
  input: AgencySignupInput,
): Promise<RegisterAgencyState> {
  const parsed = agencySignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  try {
    await createAgencySignup(parsed.data);
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: { email: "This email is already registered. Sign in instead." },
      };
    }
    console.error("Agency signup failed", error);
    return {
      status: "error",
      message: "Something went wrong creating your workspace. Please try again.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/onboarding",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created but sign-in failed. Please sign in with your email.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
