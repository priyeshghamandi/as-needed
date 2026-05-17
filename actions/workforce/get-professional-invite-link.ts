"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { findPendingInviteUrl, formatInviteUrl } from "@/lib/invites/invite-url";
import { createUserInvite } from "@/lib/services/invites";

export type GetInviteLinkState =
  | { status: "success"; inviteUrl: string; created: boolean }
  | { status: "error"; message: string };

export async function getProfessionalInviteLinkAction(
  professionalId: string,
): Promise<GetInviteLinkState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageWorkforce(context.userId, agencyId);

    const [pro] = await db
      .select({
        email: HealthcareProfessionalTable.email,
        userId: HealthcareProfessionalTable.userId,
      })
      .from(HealthcareProfessionalTable)
      .where(
        and(
          eq(HealthcareProfessionalTable.id, professionalId),
          eq(HealthcareProfessionalTable.agencyId, agencyId),
        ),
      )
      .limit(1);

    if (!pro) return { status: "error", message: "Professional not found." };
    if (pro.userId) {
      return { status: "error", message: "This professional already has an account." };
    }
    if (!pro.email) {
      return { status: "error", message: "Add an email address before generating an invite link." };
    }

    const existing = await findPendingInviteUrl({
      agencyId,
      email: pro.email,
      inviteType: "provider",
    });
    if (existing) {
      return { status: "success", inviteUrl: existing, created: false };
    }

    const invite = await createUserInvite(
      { email: pro.email, role: "provider", inviteType: "provider" },
      context.userId,
      agencyId,
    );

    return {
      status: "success",
      inviteUrl: formatInviteUrl(invite.token),
      created: true,
    };
  } catch (error) {
    console.error("getProfessionalInviteLinkAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to get invite link.",
    };
  }
}
