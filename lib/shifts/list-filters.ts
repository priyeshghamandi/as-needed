import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { FacilityTable, ShiftTable, StaffingRequestTable } from "@/drizzle/schema";

export const PAGE_SIZE = 25;

export type ShiftsListParams = {
  status?: string[];
  facilityId?: string;
  staffingRequestId?: string;
  from?: string;
  to?: string;
  unfilled?: boolean;
  page?: number;
};

export function parseShiftsListParams(searchParams: URLSearchParams): ShiftsListParams {
  const statusRaw = searchParams.get("status");
  return {
    status: statusRaw
      ? statusRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
    facilityId: searchParams.get("facilityId") ?? undefined,
    staffingRequestId: searchParams.get("staffingRequestId") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    unfilled: searchParams.get("unfilled") === "1",
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
  };
}

export function buildShiftsListQueryString(params: ShiftsListParams): string {
  const sp = new URLSearchParams();
  if (params.status?.length) sp.set("status", params.status.join(","));
  if (params.facilityId) sp.set("facilityId", params.facilityId);
  if (params.staffingRequestId) sp.set("staffingRequestId", params.staffingRequestId);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.unfilled) sp.set("unfilled", "1");
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function buildShiftWhereConditions(agencyId: string, params: ShiftsListParams) {
  const conditions = [eq(ShiftTable.agencyId, agencyId)];

  if (params.status?.length) {
    conditions.push(
      inArray(ShiftTable.status, params.status as (typeof ShiftTable.$inferSelect)["status"][]),
    );
  }
  if (params.facilityId) {
    conditions.push(eq(ShiftTable.facilityId, params.facilityId));
  }
  if (params.staffingRequestId) {
    conditions.push(eq(ShiftTable.staffingRequestId, params.staffingRequestId));
  }
  if (params.from) {
    const fromDate = new Date(params.from);
    if (!Number.isNaN(fromDate.getTime())) {
      conditions.push(gte(ShiftTable.startAt, fromDate));
    }
  }
  if (params.to) {
    const toDate = new Date(params.to);
    if (!Number.isNaN(toDate.getTime())) {
      conditions.push(lte(ShiftTable.startAt, toDate));
    }
  }

  return conditions;
}
