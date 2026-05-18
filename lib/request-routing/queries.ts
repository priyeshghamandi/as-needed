import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import {
  FacilityTable,
  HealthcareProfessionalTable,
  StaffingRequestRouteTable,
  StaffingRequestSelectionTable,
  StaffingRequestTable,
} from "@/drizzle/schema";
import type { StaffingRequestRoutingStatus } from "@/lib/ui/routing-status";

export type RoutedRequestListItem = {
  routeId: string;
  staffingRequestId: string;
  title: string;
  facilityName: string;
  fulfillmentStatus: string | null;
  routingStatus: StaffingRequestRoutingStatus;
  routedAt: Date | null;
  responseDueAt: Date | null;
  selectionCount: number;
  professionalNames: string;
  isOverdue: boolean;
};

export async function getRoutedRequestsForAgency(
  agencyId: string,
): Promise<RoutedRequestListItem[]> {
  const routes = await db
    .select({
      routeId: StaffingRequestRouteTable.id,
      staffingRequestId: StaffingRequestRouteTable.staffingRequestId,
      routingStatus: StaffingRequestRouteTable.routingStatus,
      routedAt: StaffingRequestRouteTable.routedAt,
      responseDueAt: StaffingRequestRouteTable.responseDueAt,
      title: StaffingRequestTable.title,
      fulfillmentStatus: StaffingRequestTable.fulfillmentStatus,
      facilityName: FacilityTable.name,
    })
    .from(StaffingRequestRouteTable)
    .innerJoin(
      StaffingRequestTable,
      eq(StaffingRequestRouteTable.staffingRequestId, StaffingRequestTable.id),
    )
    .innerJoin(FacilityTable, eq(StaffingRequestTable.facilityId, FacilityTable.id))
    .where(
      and(
        eq(StaffingRequestRouteTable.agencyId, agencyId),
        eq(StaffingRequestTable.source, "marketplace_customer"),
      ),
    )
    .orderBy(desc(StaffingRequestRouteTable.routedAt));

  if (routes.length === 0) return [];

  const requestIds = routes.map((r) => r.staffingRequestId);
  const selections = await db
    .select({
      staffingRequestId: StaffingRequestSelectionTable.staffingRequestId,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
    })
    .from(StaffingRequestSelectionTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(StaffingRequestSelectionTable.healthcareProfessionalId, HealthcareProfessionalTable.id),
    )
    .where(
      and(
        inArray(StaffingRequestSelectionTable.staffingRequestId, requestIds),
        eq(StaffingRequestSelectionTable.agencyId, agencyId),
      ),
    )
    .orderBy(StaffingRequestSelectionTable.sortOrder);

  const selectionMap = new Map<string, string[]>();
  for (const row of selections) {
    const name = `${row.firstName} ${row.lastName}`.trim();
    const list = selectionMap.get(row.staffingRequestId) ?? [];
    list.push(name);
    selectionMap.set(row.staffingRequestId, list);
  }

  const now = Date.now();

  return routes.map((route) => {
    const names = selectionMap.get(route.staffingRequestId) ?? [];
    const isOverdue =
      route.routingStatus === "routed" &&
      route.responseDueAt != null &&
      route.responseDueAt.getTime() < now;

    return {
      routeId: route.routeId,
      staffingRequestId: route.staffingRequestId,
      title: route.title,
      facilityName: route.facilityName,
      fulfillmentStatus: route.fulfillmentStatus,
      routingStatus: route.routingStatus as StaffingRequestRoutingStatus,
      routedAt: route.routedAt,
      responseDueAt: route.responseDueAt,
      selectionCount: names.length,
      professionalNames: names.join(", "),
      isOverdue,
    };
  });
}

export async function countRoutedQueueBadge(agencyId: string): Promise<number> {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(StaffingRequestRouteTable)
    .innerJoin(
      StaffingRequestTable,
      eq(StaffingRequestRouteTable.staffingRequestId, StaffingRequestTable.id),
    )
    .where(
      and(
        eq(StaffingRequestRouteTable.agencyId, agencyId),
        eq(StaffingRequestRouteTable.routingStatus, "routed"),
        eq(StaffingRequestTable.source, "marketplace_customer"),
      ),
    );

  return row?.count ?? 0;
}

export type AgencyRouteContext = {
  routeId: string;
  routingStatus: StaffingRequestRoutingStatus;
  routedAt: Date | null;
  responseDueAt: Date | null;
  isOverdue: boolean;
};

export async function getAgencyRouteForRequest(
  agencyId: string,
  staffingRequestId: string,
): Promise<AgencyRouteContext | null> {
  const [row] = await db
    .select({
      routeId: StaffingRequestRouteTable.id,
      routingStatus: StaffingRequestRouteTable.routingStatus,
      routedAt: StaffingRequestRouteTable.routedAt,
      responseDueAt: StaffingRequestRouteTable.responseDueAt,
    })
    .from(StaffingRequestRouteTable)
    .where(
      and(
        eq(StaffingRequestRouteTable.agencyId, agencyId),
        eq(StaffingRequestRouteTable.staffingRequestId, staffingRequestId),
      ),
    )
    .limit(1);

  if (!row) return null;

  const now = Date.now();
  return {
    routeId: row.routeId,
    routingStatus: row.routingStatus as StaffingRequestRoutingStatus,
    routedAt: row.routedAt,
    responseDueAt: row.responseDueAt,
    isOverdue:
      row.routingStatus === "routed" &&
      row.responseDueAt != null &&
      row.responseDueAt.getTime() < now,
  };
}

export type AgencyMarketplaceSelection = {
  id: string;
  displayName: string;
  role: string;
};

export async function getAgencyMarketplaceSelections(
  agencyId: string,
  staffingRequestId: string,
): Promise<AgencyMarketplaceSelection[]> {
  const rows = await db
    .select({
      id: HealthcareProfessionalTable.id,
      firstName: HealthcareProfessionalTable.firstName,
      lastName: HealthcareProfessionalTable.lastName,
      role: HealthcareProfessionalTable.role,
    })
    .from(StaffingRequestSelectionTable)
    .innerJoin(
      HealthcareProfessionalTable,
      eq(StaffingRequestSelectionTable.healthcareProfessionalId, HealthcareProfessionalTable.id),
    )
    .where(
      and(
        eq(StaffingRequestSelectionTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestSelectionTable.agencyId, agencyId),
      ),
    )
    .orderBy(StaffingRequestSelectionTable.sortOrder);

  return rows.map((row) => ({
    id: row.id,
    displayName: `${row.firstName} ${row.lastName}`.trim(),
    role: row.role,
  }));
}

export async function hasStaffingRequestAgencyAccess(
  agencyId: string,
  staffingRequestId: string,
): Promise<boolean> {
  const [owned] = await db
    .select({ id: StaffingRequestTable.id })
    .from(StaffingRequestTable)
    .where(
      and(eq(StaffingRequestTable.id, staffingRequestId), eq(StaffingRequestTable.agencyId, agencyId)),
    )
    .limit(1);

  if (owned) return true;

  const [routed] = await db
    .select({ id: StaffingRequestRouteTable.id })
    .from(StaffingRequestRouteTable)
    .where(
      and(
        eq(StaffingRequestRouteTable.staffingRequestId, staffingRequestId),
        eq(StaffingRequestRouteTable.agencyId, agencyId),
      ),
    )
    .limit(1);

  return Boolean(routed);
}
