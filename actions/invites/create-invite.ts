"use server";

import { requireAuthContext, assertCanCreateInvite } from "@/lib/auth/authorization";
import { createUserInvite } from "@/lib/services/invites";
import { createInviteSchema } from "@/lib/validations/invite";

export type CreateInviteState =
  | { status: "idle" }
  | {
      status: "success";
      inviteUrl: string;
      email: string;
      expiresAt: string;
    }
  | { status: "error"; message: string };

export async function createInviteAction(
  input: unknown,
): Promise<CreateInviteState> {
  const parsed = createInviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid invite details.",
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

    const invite = await createUserInvite(
      parsed.data,
      context.userId,
      agencyId,
    );

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";

    return {
      status: "success",
      inviteUrl: `${base}/invite/${invite.token}`,
      email: invite.email,
      expiresAt: invite.expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Create invite failed", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to create invite.",
    };
  }
}
