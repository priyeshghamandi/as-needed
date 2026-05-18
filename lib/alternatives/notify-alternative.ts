import { createNotificationsForUsers } from "@/lib/notifications/create-notification";
import { getRequestCreatorUserId } from "@/lib/fulfillment/recompute-status";

export async function notifyCustomerAlternativeProposed(
  staffingRequestId: string,
): Promise<void> {
  const userId = await getRequestCreatorUserId(staffingRequestId);
  if (!userId) return;

  await createNotificationsForUsers([userId], {
    agencyId: null,
    title: "Suggested alternative proposed",
    message:
      "Your agency coordinator proposed a suggested alternative professional for your staffing request. Review and approve or reject on your request detail page.",
    priority: "important",
    relatedEntityType: "staffing_request",
    relatedEntityId: staffingRequestId,
  });
}
