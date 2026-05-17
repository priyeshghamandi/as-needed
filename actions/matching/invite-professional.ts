"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { inviteProfessionalToShiftCore } from "@/lib/assignments/assignment-operations";

export type InviteProfessionalState =
  | { status: "success"; assignmentId: string }
  | { status: "error"; message: string };

export async function inviteProfessionalToShiftAction(
  shiftId: string,
  professionalId: string,
): Promise<InviteProfessionalState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageAssignments(context.userId, agencyId);

    const result = await inviteProfessionalToShiftCore(
      agencyId,
      shiftId,
      professionalId,
      context.userId,
    );
    if (!result.ok) {
      return { status: "error", message: result.message };
    }

    return { status: "success", assignmentId: result.assignmentId };
  } catch (error) {
    console.error("inviteProfessionalToShiftAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to send invite.",
    };
  }
}
