import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestTable, UserRoleTable } from "@/drizzle/schema";
import { createNotificationsForUsers } from "@/lib/notifications/create-notification";

const NOTIFY_ROLES = ["agency_owner", "agency_admin", "staffing_coordinator"] as const;

export async function notifyAgencyOfRoutedRequest(params: {
  agencyId: string;
  staffingRequestId: string;
}): Promise<void> {
  const [request] = await db
    .select({ title: StaffingRequestTable.title })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, params.staffingRequestId))
    .limit(1);

  if (!request) return;

  const coordinators = await db
    .select({ userId: UserRoleTable.userId })
    .from(UserRoleTable)
    .where(
      and(
        eq(UserRoleTable.agencyId, params.agencyId),
        inArray(UserRoleTable.role, [...NOTIFY_ROLES]),
      ),
    );

  const userIds = [...new Set(coordinators.map((c) => c.userId))];
  if (userIds.length === 0) return;

  await createNotificationsForUsers(userIds, {
    agencyId: params.agencyId,
    title: "New marketplace staffing request",
    message: `${request.title} was submitted by a facility and needs agency review.`,
    priority: "important",
    relatedEntityType: "staffing_request",
    relatedEntityId: params.staffingRequestId,
  });
}
