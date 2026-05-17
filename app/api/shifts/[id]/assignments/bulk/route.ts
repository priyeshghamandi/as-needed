import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { bulkInviteProfessionalsCore } from "@/lib/assignments/assignment-operations";
import { bulkInviteSchema } from "@/lib/validations/assignment";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanManageAssignments(authCtx.userId, agencyId);

    const { id: shiftId } = await context.params;
    const body = await request.json();
    const parsed = bulkInviteSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await bulkInviteProfessionalsCore(
      agencyId,
      shiftId,
      parsed.data.professionalIds,
      authCtx.userId,
    );

    return NextResponse.json({
      created: result.created,
      failed: result.failed,
    });
  } catch (error) {
    console.error("POST /api/shifts/[id]/assignments/bulk failed", error);
    const message = error instanceof Error ? error.message : "Unable to create invites.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
