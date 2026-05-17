"use server";

import { and, eq } from "drizzle-orm";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageWorkforce } from "@/lib/auth/workforce-access";
import { db } from "@/drizzle/db";
import { HealthcareProfessionalTable } from "@/drizzle/schema";
import { createUserInvite } from "@/lib/services/invites";

export type SendInviteState =
  | { status: "idle" }
  | { status: "success"; inviteUrl: string }
  | { status: "error"; message: string };

export async function sendProfessionalInviteAction(
  professionalId: string,
): Promise<SendInviteState> {
  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;
    if (!agencyId) return { status: "error", message: "Agency context required." };

    await assertCanManageWorkforce(context.userId, agencyId);

    const [pro] = await db
      .select({
        id: HealthcareProfessionalTable.id,
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
    if (pro.userId) return { status: "error", message: "This professional already has an account." };
    if (!pro.email) {
      return { status: "error", message: "Add an email address before sending an invite." };
    }

    const invite = await createUserInvite(
      { email: pro.email, role: "provider", inviteType: "provider" },
      context.userId,
      agencyId,
    );
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

    return { status: "success", inviteUrl: `${base}/invite/${invite.token}` };
  } catch (error) {
    console.error("sendProfessionalInviteAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to send invite. Try again.",
    };
  }
}
