import { NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/authorization";
import { assertCanViewMatchPageAccess } from "@/lib/auth/assignments-access";
import { getMatchCandidates } from "@/lib/matching/candidate-query";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { context: authCtx } = await requireAuthContext();
    const agencyId = authCtx.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: "Agency context required" }, { status: 403 });
    }

    await assertCanViewMatchPageAccess(authCtx.userId, agencyId);

    const { id } = await context.params;
    const url = new URL(request.url);
    const shiftId = url.searchParams.get("shiftId");
    if (!shiftId) {
      return NextResponse.json({ error: "shiftId is required" }, { status: 400 });
    }

    const candidates = await getMatchCandidates(agencyId, id, shiftId, {
      availableOnly: url.searchParams.get("availableOnly") === "1",
      withinServiceArea: url.searchParams.get("withinServiceArea") === "1",
      hasRequiredCredentials: url.searchParams.get("hasRequiredCredentials") === "1",
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
    });

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("GET /api/staffing-requests/[id]/matches failed", error);
    const message = error instanceof Error ? error.message : "Unable to load candidates.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
