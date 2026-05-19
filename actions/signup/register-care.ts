"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  createConsumerSignup,
  DuplicateEmailError,
} from "@/lib/services/consumer-signup";
import {
  consumerCareSignupSchema,
  mapConsumerSignupZodErrors,
  type ConsumerCareSignupFieldErrors,
  type ConsumerCareSignupInput,
} from "@/lib/validations/consumer-care-signup";

export type RegisterCareState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: ConsumerCareSignupFieldErrors };

export async function registerCareAction(
  input: ConsumerCareSignupInput,
  redirectTo = "/marketplace",
): Promise<RegisterCareState> {
  const parsed = consumerCareSignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: mapConsumerSignupZodErrors(parsed.error),
    };
  }

  try {
    await createConsumerSignup(parsed.data);
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: { email: "This email is already registered. Sign in instead." },
      };
    }
    console.error("Consumer signup failed", error);
    return {
      status: "error",
      message: "Something went wrong creating your account. Please try again.",
    };
  }

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
        message: "Account created but sign-in failed. Please sign in with your email.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
