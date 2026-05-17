import { z } from "zod";
import { geographicLocationSchema } from "@/lib/validations/geographic-location";

export const WORKFORCE_PROFESSIONAL_ROLES = [
  "rn",
  "cna",
  "emt",
  "lpn",
  "cnm",
  "cns",
  "other",
] as const;

export const WORKFORCE_ROLE_LABELS: Record<(typeof WORKFORCE_PROFESSIONAL_ROLES)[number], string> = {
  rn: "RN",
  cna: "CNA",
  emt: "EMT",
  lpn: "LPN",
  cnm: "CNM",
  cns: "CNS",
  other: "Other",
};

export const workforceProfessionalSchema = z
  .object({
    firstName: z.string().min(1, "Required").max(120),
    lastName: z.string().min(1, "Required").max(120),
    role: z.enum(WORKFORCE_PROFESSIONAL_ROLES, { message: "Select a role" }),
    specialty: z.string().max(120).optional().or(z.literal("")),
    yearsExperience: z.coerce
      .number()
      .int()
      .min(0)
      .max(60)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email"))
      .optional()
      .or(z.literal("")),
    phone: z.string().min(7, "At least 7 digits").max(50).optional().or(z.literal("")),
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

export type WorkforceProfessionalInput = z.infer<typeof workforceProfessionalSchema>;

export const updateProfessionalSchema = z.object({
  firstName: z.string().min(1, "Required").max(120),
  lastName: z.string().min(1, "Required").max(120),
  role: z.enum(WORKFORCE_PROFESSIONAL_ROLES, { message: "Select a role" }),
  specialty: z.string().max(120).optional().or(z.literal("")),
  yearsExperience: z.coerce
    .number()
    .int()
    .min(0)
    .max(60)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().min(7, "At least 7 digits").max(50).optional().or(z.literal("")),
});

export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
