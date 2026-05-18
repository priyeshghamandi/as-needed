import { z } from "zod";

export const createSuggestedAlternativeSchema = z.object({
  originalProfessionalId: z.string().uuid(),
  suggestedProfessionalId: z.string().uuid(),
  messageToCustomer: z
    .string()
    .max(500, "Message must be 500 characters or fewer.")
    .optional()
    .nullable(),
});

export const rejectSuggestedAlternativeSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or fewer.")
    .optional()
    .nullable(),
});

export type CreateSuggestedAlternativeInput = z.infer<typeof createSuggestedAlternativeSchema>;
