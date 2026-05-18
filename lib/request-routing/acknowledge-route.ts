import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { StaffingRequestRouteTable } from "@/drizzle/schema";

export type AcknowledgeRouteResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function acknowledgeStaffingRequestRoute(params: {
  agencyId: string;
  staffingRequestId: string;
  userId: string;
}): Promise<AcknowledgeRouteResult> {
  const [route] = await db
    .select({
      id: StaffingRequestRouteTable.id,
      routingStatus: StaffingRequestRouteTable.routingStatus,
    })
    .from(StaffingRequestRouteTable)
    .where(
      and(
        eq(StaffingRequestRouteTable.staffingRequestId, params.staffingRequestId),
        eq(StaffingRequestRouteTable.agencyId, params.agencyId),
      ),
    )
    .limit(1);

  if (!route) {
    return { ok: false, status: 404, message: "Route not found for this agency." };
  }

  if (route.routingStatus === "acknowledged" || route.routingStatus === "closed") {
    return { ok: true };
  }

  const now = new Date();
  await db
    .update(StaffingRequestRouteTable)
    .set({
      routingStatus: "acknowledged",
      acknowledgedAt: now,
      acknowledgedByUserId: params.userId,
      updatedAt: now,
    })
    .where(eq(StaffingRequestRouteTable.id, route.id));

  return { ok: true };
}
