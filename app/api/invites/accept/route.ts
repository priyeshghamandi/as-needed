import { NextResponse } from "next/server";
import { acceptInviteSchema } from "@/lib/validations/auth";
import { InviteError, acceptUserInvite } from "@/lib/services/invites";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  try {
    const result = await acceptUserInvite(parsed.data);
    return NextResponse.json({
      userId: result.user.id,
      email: result.user.email,
      role: result.role,
      agencyId: result.agencyId,
    });
  } catch (error) {
    if (error instanceof InviteError) {
      const status =
        error.code === "NOT_FOUND" || error.code === "INVALID"
          ? 400
          : error.code === "EXPIRED"
            ? 410
            : error.code === "EMAIL_EXISTS"
              ? 409
              : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }
    return NextResponse.json({ error: "Unable to accept invite" }, { status: 500 });
  }
}
