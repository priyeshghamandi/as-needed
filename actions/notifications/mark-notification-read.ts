"use server";

import { revalidateTag } from "next/cache";
import { requireAuthContext } from "@/lib/auth/authorization";
import { markNotificationRead } from "@/lib/notifications/operations";

export type NotificationActionState =
  | { status: "success" }
  | { status: "error"; message: string };

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  try {
    const { context } = await requireAuthContext();
    const result = await markNotificationRead(context.userId, notificationId);
    if (!result.ok) {
      return { status: "error", message: result.message };
    }
    revalidateTag("notifications", "max");
    return { status: "success" };
  } catch (error) {
    console.error("markNotificationReadAction failed", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to mark notification read.",
    };
  }
}
