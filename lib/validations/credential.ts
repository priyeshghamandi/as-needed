import { z } from "zod";

export const CREDENTIAL_STATUSES = [
  "pending_review",
  "verified",
  "expiring_soon",
  "expired",
  "rejected",
] as const;

export const credentialStatusSchema = z.enum(CREDENTIAL_STATUSES);

const credentialFieldsSchema = z.object({
  type: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(255),
  licenseNumber: z.string().trim().max(120).optional().or(z.literal("")),
  issuingAuthority: z.string().trim().max(255).optional().or(z.literal("")),
  issuedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  documentUrl: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Document URL must be http or https.",
    }),
});

function refineCredentialDates<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const row = data as {
      issuedAt?: string;
      expiresAt?: string;
    };
    if (row.issuedAt && row.expiresAt) {
      const issued = new Date(row.issuedAt);
      const expires = new Date(row.expiresAt);
      if (expires < issued) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Expiration must be on or after issue date.",
        });
      }
    }
  });
}

export const credentialInputSchema = refineCredentialDates(
  credentialFieldsSchema.extend({
    professionalId: z.string().uuid(),
  }),
);

export const credentialUpdateSchema = refineCredentialDates(credentialFieldsSchema);

export const rejectCredentialSchema = z.object({
  reason: z.string().trim().min(10).max(500),
});

export const updateCredentialStatusSchema = z.object({
  status: credentialStatusSchema,
});

export type CredentialInput = z.infer<typeof credentialInputSchema>;
export type CredentialUpdateInput = z.infer<typeof credentialUpdateSchema>;

export function parseDateField(value: string | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return v;
}
