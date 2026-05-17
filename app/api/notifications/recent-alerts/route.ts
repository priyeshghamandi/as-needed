import { NextResponse } from "next/server";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { resolveNotificationEntityHrefAsync } from "@/lib/notifications/entity-route";
import { getUnreadUrgentCritical } from "@/lib/notifications/unread-count";

export async function GET() {
  try {
    const { context } = await requireAuthContext();
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const rows = await getUnreadUrgentCritical(
      context.userId,
      context.agencyId,
      since,
    );

    const items = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        title: row.title,
        message: row.message,
        priority: row.priority,
        href: await resolveNotificationEntityHrefAsync(
          row.relatedEntityType,
          row.relatedEntityId,
        ),
        createdAt: row.createdAt.toISOString(),
      })),
    );

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/notifications/recent-alerts failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
