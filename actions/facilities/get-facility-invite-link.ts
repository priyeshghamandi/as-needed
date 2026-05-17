"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { FacilityTable } from "@/drizzle/schema";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageFacilities } from "@/lib/auth/facilities-access";
import { findPendingInviteUrl, formatInviteUrl } from "@/lib/invites/invite-url";
import { createUserInvite } from "@/lib/services/invites";

export type GetFacilityInviteLinkState =
  | { status: "success"; inviteUrl: string; created: boolean }
  | { status: "error"; message: string };

export async function getFacilityInviteLinkAction(
  facilityId: string,
): Promise<GetFacilityInviteLinkState> {
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
      return {
        status: "error",
        message: "Add a contact email before generating an invite link.",
      };
    }

    const existing = await findPendingInviteUrl({
      agencyId,
      email: facility.contactEmail,
      facilityId,
      inviteType: "facility_user",
    });
    if (existing) {
      return { status: "success", inviteUrl: existing, created: false };
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

    return {
      status: "success",
      inviteUrl: formatInviteUrl(invite.token),
      created: true,
    };
  } catch (error) {
    console.error("getFacilityInviteLinkAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to get invite link.",
    };
  }
}
