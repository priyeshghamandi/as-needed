import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";

export const consumerCareSignupSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Enter a valid email" })),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  careSiteName: z.string().trim().max(120).optional().or(z.literal("")),
  location: geographicLocationSchema,
  acceptedTerms: z.literal(true, {
    message: "You must accept the terms to continue",
  }),
});

export type ConsumerCareSignupInput = z.infer<typeof consumerCareSignupSchema>;

export type ConsumerCareSignupFieldErrors = Partial<
  Record<keyof ConsumerCareSignupInput | "location", string>
>;

export function mapConsumerSignupZodErrors(
  error: z.ZodError,
): ConsumerCareSignupFieldErrors {
  const fieldErrors: ConsumerCareSignupFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() as keyof ConsumerCareSignupFieldErrors;
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
