import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { FacilityTable, StaffingRequestTable } from "@/drizzle/schema";

export const PAGE_SIZE = 25;

export type StaffingRequestsListParams = {
  q?: string;
  status?: string[];
  facilityId?: string;
  priority?: string;
  coordinatorId?: string;
  from?: string;
  to?: string;
  page?: number;
};

export function parseStaffingRequestsListParams(
  searchParams: URLSearchParams,
): StaffingRequestsListParams {
  const statusRaw = searchParams.get("status");
  const status = statusRaw
    ? statusRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  return {
    q: searchParams.get("q") ?? undefined,
    status: status?.length ? status : undefined,
    facilityId: searchParams.get("facilityId") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    coordinatorId: searchParams.get("coordinatorId") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
  };
}

export function buildListQueryString(params: StaffingRequestsListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status?.length) sp.set("status", params.status.join(","));
  if (params.facilityId) sp.set("facilityId", params.facilityId);
  if (params.priority) sp.set("priority", params.priority);
  if (params.coordinatorId) sp.set("coordinatorId", params.coordinatorId);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function buildStaffingRequestWhereConditions(
  agencyId: string,
  params: StaffingRequestsListParams,
) {
  const conditions = [eq(StaffingRequestTable.agencyId, agencyId)];

  if (params.status?.length) {
    conditions.push(
      inArray(
        StaffingRequestTable.status,
        params.status as (typeof StaffingRequestTable.$inferSelect)["status"][],
      ),
    );
  }
  if (params.facilityId) {
    conditions.push(eq(StaffingRequestTable.facilityId, params.facilityId));
  }
  if (params.priority) {
    conditions.push(eq(StaffingRequestTable.priority, params.priority));
  }
  if (params.coordinatorId) {
    conditions.push(eq(StaffingRequestTable.assignedCoordinatorId, params.coordinatorId));
  }
  if (params.q?.trim()) {
    const pattern = `%${params.q.trim()}%`;
    conditions.push(
      or(
        ilike(StaffingRequestTable.title, pattern),
        ilike(FacilityTable.name, pattern),
      )!,
    );
  }
  return conditions;
}
