import { NextResponse } from "next/server";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { requireLinkedProviderContext } from "@/lib/auth/provider-context";
import { getProviderShiftDetail } from "@/lib/provider/provider-shifts";

type RouteContext = { params: Promise<{ assignmentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { professional } = await requireLinkedProviderContext();
    const { assignmentId } = await context.params;
    const detail = await getProviderShiftDetail(professional.id, assignmentId);

    if (!detail) {
      return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/provider/shifts/[assignmentId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
