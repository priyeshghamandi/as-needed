import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { getUnreadNotificationCount } from "@/lib/notifications/unread-count";

export async function GET() {
  try {
    const { context } = await requireAuthContext();
    const count = await getUnreadNotificationCount(
      context.userId,
      context.agencyId,
    );
    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/notifications/unread-count failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
