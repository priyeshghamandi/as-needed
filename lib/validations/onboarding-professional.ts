import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";

export const PROFESSIONAL_ROLES = ["rn", "cna", "emt", "lpn", "cnm", "cns"] as const;

export const PROFESSIONAL_ROLE_LABELS: Record<(typeof PROFESSIONAL_ROLES)[number], string> = {
  rn: "RN",
  cna: "CNA",
  emt: "EMT",
  lpn: "LPN",
  cnm: "CNM",
  cns: "CNS",
};

export const onboardingProfessionalSchema = z
  .object({
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120),
    role: z.enum(PROFESSIONAL_ROLES),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email"))
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .min(7, "Phone must be at least 7 digits")
      .max(50)
      .optional()
      .or(z.literal("")),
    location: geographicLocationSchema,
    sendInvite: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "At least one of email or phone is required",
      });
    }
    if (data.sendInvite && !data.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required to send an invite",
      });
    }
  });

export type OnboardingProfessionalInput = z.infer<typeof onboardingProfessionalSchema>;
