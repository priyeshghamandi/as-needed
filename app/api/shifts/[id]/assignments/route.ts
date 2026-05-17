import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanManageAssignments } from "@/lib/auth/assignments-access";
import { inviteProfessionalToShiftCore } from "@/lib/assignments/assignment-operations";
import { inviteProfessionalSchema } from "@/lib/validations/assignment";

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
    const parsed = inviteProfessionalSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const result = await inviteProfessionalToShiftCore(
      agencyId,
      shiftId,
      parsed.data.professionalId,
      authCtx.userId,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({ id: result.assignmentId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/shifts/[id]/assignments failed", error);
    const message = error instanceof Error ? error.message : "Unable to create invite.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
