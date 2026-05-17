import { z } from "zod";

const MIN_BLOCK_MS = 30 * 60 * 1000;
const MAX_BLOCK_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_NOTES = 500;
const MAX_PAST_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export const availabilityBlockStatusSchema = z.enum(["available", "unavailable"]);

export const availabilityBlockSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: availabilityBlockStatusSchema,
    notes: z.string().trim().max(MAX_NOTES).optional(),
  })
  .superRefine((data, ctx) => {
    const duration = data.endAt.getTime() - data.startAt.getTime();
    if (duration < MIN_BLOCK_MS) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Block must be at least 30 minutes.",
      });
    }
    if (duration > MAX_BLOCK_MS) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "Block cannot exceed 14 days.",
      });
    }
    const earliest = Date.now() - MAX_PAST_DAYS_MS;
    if (data.startAt.getTime() < earliest) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Cannot create blocks starting more than 90 days in the past.",
      });
    }
  });

export type AvailabilityBlockInput = z.infer<typeof availabilityBlockSchema>;

export function parseAvailabilityBlockInput(body: unknown) {
  return availabilityBlockSchema.safeParse(body);
}
