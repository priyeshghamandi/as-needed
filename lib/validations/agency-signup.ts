import { z } from "zod";

export const agencyTypeValues = ["per-diem", "travel", "allied", "mixed"] as const;
export const workforceSizeValues = [
  "1-25",
  "26-100",
  "101-500",
  "501-2000",
  "2000+",
] as const;

export const serviceAreaSchema = z.object({
  displayName: z.string().min(1, "Select a service area from the suggestions"),
  placeId: z.string().min(1),
  city: z.string(),
  state: z.string(),
  country: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

const signupBaseFields = {
  agencyName: z.string().trim().min(2, "Agency name is required"),
  agencyType: z.enum(agencyTypeValues, { message: "Select an agency type" }),
  ownerName: z.string().trim().min(2, "Owner name is required"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .max(50, "Phone number is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Enter a valid work email" })),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  acceptedTerms: z.literal(true, {
    message: "You must accept the terms to continue",
  }),
};

const workforceSizeField = z.enum(workforceSizeValues, {
  message: "Select your workforce size",
});

export const agencySignupSchema = z
  .object({
    ...signupBaseFields,
    workforceSize: workforceSizeField,
    serviceArea: serviceAreaSchema,
  })
  .strict();

/** Client form schema — service area starts unset until user picks a suggestion. */
export const agencySignupFormSchema = z
  .object({
    ...signupBaseFields,
    workforceSize: z.union([workforceSizeField, z.literal("")]),
    serviceArea: serviceAreaSchema.nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.workforceSize) {
      ctx.addIssue({
        code: "custom",
        path: ["workforceSize"],
        message: "Select your workforce size",
      });
    }
    if (!data.serviceArea) {
      ctx.addIssue({
        code: "custom",
        path: ["serviceArea"],
        message: "Select a service area from the suggestions",
      });
    }
  });

export type AgencySignupInput = z.infer<typeof agencySignupSchema>;
export type AgencySignupFormInput = z.infer<typeof agencySignupFormSchema>;

export type AgencySignupFieldErrors = Partial<
  Record<keyof AgencySignupFormInput | "root", string>
>;

export function toAgencySignupInput(
  data: AgencySignupFormInput,
): AgencySignupInput {
  if (!data.serviceArea || !data.workforceSize) {
    throw new Error("Invalid signup form state");
  }
  return {
    ...data,
    workforceSize: data.workforceSize,
    serviceArea: data.serviceArea,
  };
}

export function mapZodErrors(
  error: z.ZodError,
): AgencySignupFieldErrors {
  const out: AgencySignupFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key as keyof AgencySignupInput]) {
      out[key as keyof AgencySignupInput] = issue.message;
    }
  }
  return out;
}

/** Client-side password strength score 0–4 (matches existing UI bars). */
export function passwordStrengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
