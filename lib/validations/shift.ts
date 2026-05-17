import { z } from "zod";

export const SHIFT_TYPES = ["day", "evening", "night", "on_call", "custom"] as const;

export const updateShiftSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
    breakMinutes: z.coerce.number().int().min(0).max(480).optional(),
    requiredCount: z.coerce.number().int().min(1).max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endAt <= data.startAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End time must be after start time",
      });
    }
  });

export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;

export const createSecondaryShiftSchema = z
  .object({
    staffingRequestId: z.string().uuid(),
    facilityId: z.string().uuid(),
    shiftDate: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    shiftType: z.enum(SHIFT_TYPES).optional().or(z.literal("")),
    breakMinutes: z.coerce.number().int().min(0).max(480).optional(),
    requiredCount: z.coerce.number().int().min(1).max(50).default(1),
  })
  .superRefine((data, ctx) => {
    const startParts = data.startTime.match(/^(\d{1,2}):(\d{2})$/);
    const endParts = data.endTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!startParts || !endParts) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "Invalid time" });
      return;
    }
    const [y, m, d] = data.shiftDate.split("-").map(Number);
    const start = new Date(y, m - 1, d, Number(startParts[1]), Number(startParts[2]));
    let end = new Date(y, m - 1, d, Number(endParts[1]), Number(endParts[2]));
    if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
  });

export type CreateSecondaryShiftInput = z.infer<typeof createSecondaryShiftSchema>;
