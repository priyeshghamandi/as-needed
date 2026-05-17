"use server";

import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { bulkInviteProfessionalsCore } from "@/lib/assignments/assignment-operations";

export type BulkInviteState =
  | { status: "success"; created: string[]; failed: { professionalId: string; message: string }[] }
  | { status: "error"; message: string };

export async function bulkInviteProfessionalsAction(
  shiftId: string,
  professionalIds: string[],
): Promise<BulkInviteState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageAssignments(context.userId, agencyId);

    const result = await bulkInviteProfessionalsCore(
      agencyId,
      shiftId,
      professionalIds,
      context.userId,
    );

    return { status: "success", created: result.created, failed: result.failed };
  } catch (error) {
    console.error("bulkInviteProfessionalsAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to send invites.",
    };
  }
}
