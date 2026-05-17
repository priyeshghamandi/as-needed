"use server";

import { revalidateTag } from "next/cache";
import { requireAuthContext } from "@/lib/auth/authorization";
import { markAllNotificationsRead } from "@/lib/notifications/operations";

export type MarkAllNotificationsState =
  | { status: "success"; updated: number }
  | { status: "error"; message: string };

export async function markAllNotificationsReadAction(): Promise<MarkAllNotificationsState> {
  try {
    const { context } = await requireAuthContext();
    const result = await markAllNotificationsRead(
      context.userId,
      context.agencyId,
    );
    revalidateTag("notifications", "max");
    return { status: "success", updated: result.updated };
  } catch (error) {
    console.error("markAllNotificationsReadAction failed", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to mark all notifications read.",
    };
  }
}
