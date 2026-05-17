"use server";

import { requireAuthContext, assertCanCreateInvite } from "@/lib/auth/authorization";
import { teamDisplayRoleToAppRole } from "@/lib/onboarding/team-invite-roles";
import { createUserInvite } from "@/lib/services/invites";
import { z } from "zod";

const teamInviteRowSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Enter a valid email" })),
  role: z.string().min(1),
});

const sendTeamInvitesSchema = z.object({
  invites: z.array(teamInviteRowSchema).min(1).max(20),
});

export type TeamInviteResult = {
  email: string;
  status: "sent" | "skipped" | "error";
  inviteUrl?: string;
  message?: string;
};

export type SendTeamInvitesState =
  | { status: "idle" }
  | { status: "success"; results: TeamInviteResult[] }
  | { status: "error"; message: string; results?: TeamInviteResult[] };

export async function sendTeamInvitesAction(
  input: unknown,
): Promise<SendTeamInvitesState> {
  const parsed = sendTeamInvitesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid invite list.",
    };
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return {
        status: "error",
        message: "You must belong to an agency to send invites.",
      };
    }

    await assertCanCreateInvite(context.userId, agencyId);

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";

    const results: TeamInviteResult[] = [];

    for (const row of parsed.data.invites) {
      const appRole = teamDisplayRoleToAppRole(row.role);
      if (!appRole) {
        results.push({
          email: row.email,
          status: "error",
          message: `Unknown role: ${row.role}`,
        });
        continue;
      }

      try {
        const invite = await createUserInvite(
          {
            email: row.email,
            role: appRole,
            inviteType: "agency_staff",
          },
          context.userId,
          agencyId,
        );

        results.push({
          email: row.email,
          status: "sent",
          inviteUrl: `${base}/invite/${invite.token}`,
        });
      } catch (error) {
        results.push({
          email: row.email,
          status: "error",
          message:
            error instanceof Error ? error.message : "Unable to create invite.",
        });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    if (sent === 0) {
      return {
        status: "error",
        message: "No invitations were sent. Fix the errors below and try again.",
        results,
      };
    }

    return { status: "success", results };
  } catch (error) {
    console.error("Send team invites failed", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to send invitations.",
    };
  }
}
