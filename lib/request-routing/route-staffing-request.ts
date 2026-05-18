import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  StaffingRequestRouteTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";

const ROUTING_SLA_HOURS = 4;

export async function routeStaffingRequest(requestId: string): Promise<void> {
  const selections = await db
    .select({
      agencyId: StaffingRequestSelectionTable.agencyId,
    })
    .from(StaffingRequestSelectionTable)
    .where(eq(StaffingRequestSelectionTable.staffingRequestId, requestId));

  const agencyIds = [...new Set(selections.map((s) => s.agencyId))];
  if (agencyIds.length === 0) return;

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
  }

  await db
    .update(StaffingRequestTable)
    .set({
      fulfillmentStatus: "pending_agency_review",
      updatedAt: now,
    })
    .where(eq(StaffingRequestTable.id, requestId));
}
