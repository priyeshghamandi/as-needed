import type { StaffingRequestStatus } from "@/lib/ui/status-colors";

const STATUSES: StaffingRequestStatus[] = [
  "draft",
  "open",
  "matching",
  "partially_filled",
  "confirmed",
  "at_risk",
  "completed",
  "cancelled",
];

export type FacilityRequestListParams = {
  status?: StaffingRequestStatus[];
  priority?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export function parseFacilityRequestListParams(
  searchParams: URLSearchParams,
): FacilityRequestListParams {
  const statusRaw = searchParams.get("status");
  const status = statusRaw
    ? statusRaw
        .split(",")
        .filter((s): s is StaffingRequestStatus =>
          STATUSES.includes(s as StaffingRequestStatus),
        )
    : undefined;

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20") || 20));

  return {
    status: status?.length ? status : undefined,
    priority: searchParams.get("priority")?.trim() || undefined,
    search: searchParams.get("q")?.trim() || undefined,
    page,
    pageSize,
  };
}
