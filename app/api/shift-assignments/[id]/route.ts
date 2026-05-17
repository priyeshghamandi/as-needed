import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import {
  assertCanManageAssignments,
  assertProviderOwnsAssignment,
  getAssignmentAgencyId,
} from "@/lib/auth/assignments-access";
import {
  cancelShiftAssignmentCore,
  confirmShiftAssignmentCore,
  respondToShiftAssignmentCore,
} from "@/lib/assignments/assignment-operations";
import { acceptShiftAssignmentForProvider } from "@/lib/provider/accept-shift-assignment";
import { isProviderRole, type AppRole } from "@/lib/auth/roles";
import { respondToAssignmentSchema } from "@/lib/validations/assignment";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const { id } = await context.params;
    const body = await request.json();

    const isProvider = isProviderRole((authCtx.primaryRole ?? "") as AppRole);

    if (isProvider) {
      const parsed = respondToAssignmentSchema.safeParse(body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return NextResponse.json(
          { error: issue?.message ?? "Invalid input" },
          { status: 400 },
        );
      }

      const { professionalId } = await assertProviderOwnsAssignment(authCtx.userId, id);

      const result =
        parsed.data.status === "accepted"
          ? await acceptShiftAssignmentForProvider(id, professionalId)
          : await respondToShiftAssignmentCore(id, parsed.data);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }

      return NextResponse.json({ id: result.assignmentId });
    }

    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    const assignmentAgencyId = await getAssignmentAgencyId(id);
    if (!assignmentAgencyId || assignmentAgencyId !== agencyId) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    }

    await assertCanManageAssignments(authCtx.userId, agencyId);

    if (body.action === "cancel") {
      const result = await cancelShiftAssignmentCore(
        agencyId,
        id,
        body.cancellationReason,
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json({ id: result.assignmentId });
    }

    if (body.action === "confirm") {
      const result = await confirmShiftAssignmentCore(agencyId, id);
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: result.status });
      }
      return NextResponse.json({ id: result.assignmentId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/shift-assignments/[id] failed", error);
    const message = error instanceof Error ? error.message : "Unable to update assignment.";
    const status = message.includes("permission") || message.includes("access") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
