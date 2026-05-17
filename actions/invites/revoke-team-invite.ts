"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext, assertCanCreateInvite, ForbiddenError } from "@/lib/auth/authorization";
import { revokeUserInvite, InviteError } from "@/lib/services/invites";

export type RevokeTeamInviteState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function revokeTeamInviteAction(
  inviteId: string,
): Promise<RevokeTeamInviteState> {
  if (!inviteId) {
    return { status: "error", message: "Invite id is required." };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return { status: "error", message: "Agency context required." };
    }

    await assertCanCreateInvite(context.userId, agencyId);
    await revokeUserInvite(inviteId, agencyId);
    revalidatePath("/settings");

    return { status: "success" };
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof InviteError) {
      return {
        status: "error",
        message: error.message,
      };
    }
    console.error("revokeTeamInviteAction failed", error);
    return { status: "error", message: "Unable to revoke invite." };
  }
}
