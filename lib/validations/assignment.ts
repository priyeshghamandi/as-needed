import { z } from "zod";

export const inviteProfessionalSchema = z.object({
  professionalId: z.string().uuid(),
});

export const bulkInviteSchema = z.object({
  professionalIds: z.array(z.string().uuid()).min(1).max(50),
});

export const respondToAssignmentSchema = z
  .object({
    status: z.enum(["accepted", "declined"]),
    declineReason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "declined" && (data.declineReason?.length ?? 0) < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["declineReason"],
        message: "Decline reason must be at least 3 characters.",
      });
    }
  });

export const patchAssignmentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
    cancellationReason: z.string().trim().optional(),
  }),
  z.object({
    action: z.literal("confirm"),
  }),
  respondToAssignmentSchema.extend({
    action: z.literal("respond"),
  }),
]);

export type RespondToAssignmentInput = z.infer<typeof respondToAssignmentSchema>;
