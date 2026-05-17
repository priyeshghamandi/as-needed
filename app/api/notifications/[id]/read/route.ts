import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { markNotificationRead } from "@/lib/notifications/operations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const { context: authContext } = await requireAuthContext();
    const { id } = await context.params;
    const result = await markNotificationRead(authContext.userId, id);

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    revalidateTag("notifications", "max");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("PATCH /api/notifications/[id]/read failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
