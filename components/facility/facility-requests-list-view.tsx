"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FacilityShell } from "@/components/facility/facility-shell";
import {
  StatusBadge,
  roleNeededLabel,
} from "@/lib/staffing-requests/staffing-requests-ui";
import { PRIORITY_LABELS, PRIORITY_TONES } from "@/lib/ui/status-colors";
import { Badge } from "@/components/primitives";
import type { FacilityRequestListItem } from "@/lib/facility/queries";
import type { StaffingRequestStatus } from "@/lib/ui/status-colors";

const PRIMARY_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-colors h-11 px-5 text-[14px] bg-ink-900 text-paper hover:bg-ink-800 border border-ink-900";

const STATUS_OPTIONS: { value: StaffingRequestStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "matching", label: "Matching" },
  { value: "partially_filled", label: "Partially filled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "at_risk", label: "At risk" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function FacilityRequestsListView({
  facilityName,
  agencyName,
  userName,
  userInitials,
  items,
  total,
  page,
  pageSize,
  initialStatus,
  initialSearch,
}: {
  facilityName: string;
  agencyName: string;
  userName: string;
  userInitials: string;
  items: FacilityRequestListItem[];
  total: number;
  page: number;
  pageSize: number;
  initialStatus?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (!patch.page) next.delete("page");
    router.push(`/facility/requests?${next.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <FacilityShell
      facilityName={facilityName}
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      title="Staffing requests"
      subtitle="Track fulfillment for requests submitted from your facility."
      headerAction={
        <Link href="/facility/requests/new" className={PRIMARY_LINK_CLASS}>
          Create staffing request
        </Link>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label className="flex-1">
          <span className="sr-only">Search by title</span>
          <input
            type="search"
            defaultValue={initialSearch ?? ""}
            placeholder="Search by title"
            className="w-full h-10 px-3 rounded-lg border border-ink-200 text-[14px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilters({ q: (e.target as HTMLInputElement).value || undefined });
              }
            }}
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            defaultValue={initialStatus ?? ""}
            className="h-10 px-3 rounded-lg border border-ink-200 text-[14px] bg-white min-w-[160px]"
            onChange={(e) =>
              updateFilters({ status: e.target.value || undefined })
            }
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center space-y-4">
          <p className="text-[15px] text-ink-700">No staffing requests match your filters.</p>
          <Link href="/facility/requests/new" className={PRIMARY_LINK_CLASS}>
            Create staffing request
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-ink-200 bg-white overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 text-left text-ink-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Filled</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Coordinator</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/facility/requests/${row.id}`}
                        className="font-medium text-teal-800 hover:underline"
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{row.roleLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">
                      {row.assignedCount}/{row.professionalsRequired}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PRIORITY_TONES[row.priority] ?? "neutral"}>
                        {PRIORITY_LABELS[row.priority] ?? row.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {row.coordinatorName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-600">
                      {row.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-3">
            {items.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/facility/requests/${row.id}`}
                  className="block rounded-xl border border-ink-200 bg-white p-4 hover:border-teal-300"
                >
                  <p className="font-medium text-[15px]">{row.title}</p>
                  <p className="text-[12px] text-ink-600 mt-1">
                    {roleNeededLabel(row.roleNeeded)} · {row.assignedCount}/
                    {row.professionalsRequired} filled
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={row.status} />
                    <Badge tone={PRIORITY_TONES[row.priority] ?? "neutral"}>
                      {PRIORITY_LABELS[row.priority] ?? row.priority}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className="flex justify-center gap-2 mt-6">
              <button
                type="button"
                disabled={page <= 1}
                className="h-9 px-3 rounded-lg border border-ink-200 text-[13px] disabled:opacity-40"
                onClick={() => updateFilters({ page: String(page - 1) })}
              >
                Previous
              </button>
              <span className="text-[13px] text-ink-600 self-center">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                className="h-9 px-3 rounded-lg border border-ink-200 text-[13px] disabled:opacity-40"
                onClick={() => updateFilters({ page: String(page + 1) })}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </FacilityShell>
  );
}
