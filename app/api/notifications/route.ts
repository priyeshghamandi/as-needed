import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { parseNotificationListParams } from "@/lib/notifications/list-filters";
import { listNotifications } from "@/lib/notifications/queries";

export async function GET(request: Request) {
  try {
    const { context } = await requireAuthContext();
    const { searchParams } = new URL(request.url);
    const params = parseNotificationListParams(searchParams);
    const result = await listNotifications(
      context.userId,
      context.agencyId,
      params,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/notifications failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
