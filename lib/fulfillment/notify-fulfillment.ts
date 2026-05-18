import { createNotificationsForUsers } from "@/lib/notifications/create-notification";
import { getRequestCreatorUserId } from "@/lib/fulfillment/recompute-status";

export async function notifyCustomerAgencyConfirmed(staffingRequestId: string): Promise<void> {
  const userId = await getRequestCreatorUserId(staffingRequestId);
  if (!userId) return;

  await createNotificationsForUsers([userId], {
    agencyId: null,
    title: "Agency confirmed your staffing request",
    message:
      "A coordinator confirmed fulfillment for your preferred professional(s). Review and approve to continue.",
    priority: "important",
    relatedEntityType: "staffing_request",
    relatedEntityId: staffingRequestId,
  });
}

export async function notifyCustomerAgencyDeclined(staffingRequestId: string): Promise<void> {
  const userId = await getRequestCreatorUserId(staffingRequestId);
  if (!userId) return;

  await createNotificationsForUsers([userId], {
    agencyId: null,
    title: "Agency declined your staffing request",
    message:
      "A coordinator could not fulfill your preferred selection. You may wait for a suggested alternative or cancel the request.",
    priority: "important",
    relatedEntityType: "staffing_request",
    relatedEntityId: staffingRequestId,
  });
}
