"use server";

import { and, eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageFacilities } from "@/lib/auth/facilities-access";
import { db } from "@/drizzle/db";
import { FacilityTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";

export type SendFacilityInviteState =
  | { status: "idle" }
  | { status: "success"; inviteUrl: string }
  | { status: "error"; message: string };

export async function sendFacilityInviteAction(
  facilityId: string,
): Promise<SendFacilityInviteState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageFacilities(context.userId, agencyId);

    const [facility] = await db
      .select({
        contactEmail: FacilityTable.contactEmail,
      })
      .from(FacilityTable)
      .where(
        and(eq(FacilityTable.id, facilityId), eq(FacilityTable.agencyId, agencyId)),
      )
      .limit(1);

    if (!facility) return { status: "error", message: "Facility not found." };
    if (!facility.contactEmail) {
      return { status: "error", message: "Contact email is required to send an invite." };
    }

    const invite = await createUserInvite(
      {
        email: facility.contactEmail,
        role: "facility_user",
        inviteType: "facility_user",
        facilityId,
      },
      context.userId,
      agencyId,
    );
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

    return { status: "success", inviteUrl: `${base}/invite/${invite.token}` };
  } catch (error) {
    console.error("sendFacilityInviteAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to send invite. Try again.",
    };
  }
}
