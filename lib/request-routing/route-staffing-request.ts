import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  StaffingRequestRouteTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import { ROUTING_SLA_HOURS } from "@/lib/request-routing/constants";
import { groupSelectionAgencyIds } from "@/lib/request-routing/group-selections";
import { notifyAgencyOfRoutedRequest } from "@/lib/request-routing/notify-routed-request";

export type RouteStaffingRequestResult =
  | { ok: true; agencyIds: string[]; routeCount: number }
  | { ok: false; status: number; message: string };

const TERMINAL_FULFILLMENT = new Set([
  "customer_approved",
  "customer_rejected",
  "cancelled",
]);

export async function routeStaffingRequest(
  requestId: string,
): Promise<RouteStaffingRequestResult> {
  const selections = await db
    .select({
      agencyId: StaffingRequestSelectionTable.agencyId,
    })
    .from(StaffingRequestSelectionTable)
    .where(eq(StaffingRequestSelectionTable.staffingRequestId, requestId));

  const agencyIds = groupSelectionAgencyIds(selections);
  if (agencyIds.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Cannot route a request with no professional selections.",
    };
  }

  const [request] = await db
    .select({
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
    })
    .from(StaffingRequestTable)
    .where(eq(StaffingRequestTable.id, requestId))
    .limit(1);

  if (!request) {
    return { ok: false, status: 404, message: "Staffing request not found." };
  }

  const now = new Date();
  const responseDueAt = new Date(now.getTime() + ROUTING_SLA_HOURS * 60 * 60 * 1000);

  for (const agencyId of agencyIds) {
    await db
      .insert(StaffingRequestRouteTable)
      .values({
        staffingRequestId: requestId,
        agencyId,
        routingStatus: "routed",
        routedAt: now,
        responseDueAt,
      })
      .onConflictDoUpdate({
        target: [
          StaffingRequestRouteTable.staffingRequestId,
          StaffingRequestRouteTable.agencyId,
        ],
        set: {
          routingStatus: "routed",
          routedAt: now,
          responseDueAt,
          updatedAt: now,
        },
      });

    await notifyAgencyOfRoutedRequest({ agencyId, staffingRequestId: requestId });
  }

  if (
    !request.fulfillmentStatus ||
    !TERMINAL_FULFILLMENT.has(request.fulfillmentStatus)
  ) {
    await db
      .update(StaffingRequestTable)
      .set({
        fulfillmentStatus: "pending_agency_review",
        updatedAt: now,
      })
      .where(eq(StaffingRequestTable.id, requestId));
  }

  return { ok: true, agencyIds, routeCount: agencyIds.length };
}
