import { NextResponse } from "next/server";
import { requireAuthContext, assertCanCreateInvite } from "@/lib/auth/authorization";
import { createUserInvite } from "@/lib/services/invites";
import { createInviteSchema } from "@/lib/validations/invite";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  try {
    const { context } = await requireAuthContext();
    const agencyId = context.agencyId;

    if (!agencyId) {
      return NextResponse.json(
        { error: "Agency context required" },
        { status: 403 },
      );
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

    return NextResponse.json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      inviteUrl: `${base}/invite/${invite.token}`,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create invite";
    const status = message.includes("cannot") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
