import { z } from "zod";

export const fulfillmentConfirmSchema = z.object({
  healthcareProfessionalId: z.string().uuid(),
});

export const fulfillmentDeclineSchema = z.object({
  healthcareProfessionalId: z.string().uuid(),
  declineReason: z.enum([
    "unavailable",
    "credentials",
    "scheduling_conflict",
    "other",
  ]),
  declineNotes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional()
    .nullable(),
});

export type FulfillmentConfirmInput = z.infer<typeof fulfillmentConfirmSchema>;
export type FulfillmentDeclineInput = z.infer<typeof fulfillmentDeclineSchema>;
