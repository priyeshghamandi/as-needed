import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  ForbiddenError,
  requireAuthContext,
  UnauthorizedError,
} from "@/lib/auth/authorization";
import { markAllNotificationsRead } from "@/lib/notifications/operations";

export async function POST() {
  try {
    const { context } = await requireAuthContext();
    const result = await markAllNotificationsRead(
      context.userId,
      context.agencyId,
    );
    revalidateTag("notifications", "max");
    return NextResponse.json({ updated: result.updated });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("POST /api/notifications/mark-all-read failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
