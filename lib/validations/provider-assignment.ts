import { z } from "zod";

export const declineReasonCodeSchema = z.enum([
  "unavailable",
  "schedule_conflict",
  "distance",
  "personal",
  "other",
]);

export const declineShiftAssignmentSchema = z
  .object({
    declineReasonCode: declineReasonCodeSchema,
    declineReasonOther: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.declineReasonCode === "other") {
      if ((data.declineReasonOther?.length ?? 0) < 3) {
        ctx.addIssue({
          code: "custom",
          path: ["declineReasonOther"],
          message: "Please provide a short explanation.",
        });
      }
    }
  });

export type DeclineShiftAssignmentInput = z.infer<typeof declineShiftAssignmentSchema>;

const DECLINE_LABELS: Record<z.infer<typeof declineReasonCodeSchema>, string> = {
  unavailable: "Unavailable",
  schedule_conflict: "Schedule conflict",
  distance: "Too far / distance",
  personal: "Personal reasons",
  other: "Other",
};

export function formatDeclineReason(input: DeclineShiftAssignmentInput): string {
  if (input.declineReasonCode === "other") {
    return input.declineReasonOther?.trim() ?? "Other";
  }
  return DECLINE_LABELS[input.declineReasonCode];
}
