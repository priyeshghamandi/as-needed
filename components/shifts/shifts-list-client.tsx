"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { AgencyShell } from "@/components/agency-shell";
import { canManageShifts } from "@/lib/auth/shifts-access-rules";
import { buildShiftsListQueryString } from "@/lib/shifts/list-filters";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";
import {
  formatRelativeTime,
  ShiftStatusBadge,
  shortShiftId,
} from "@/lib/shifts/shifts-ui";

export type SerializedShiftListItem = {
  id: string;
  shiftType: string | null;
  requestId: string;
  requestTitle: string;
  facilityName: string;
  startAt: string;
  endAt: string;
  requiredCount: number;
  filledCount: number;
  status: string;
  updatedAt: string;
  isUrgent: boolean;
};

type ListFilters = {
  status: string;
  unfilled: boolean;
  page: number;
};

export function ShiftsListClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  items,
  total,
  page,
  pageCount,
  filters,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  items: SerializedShiftListItem[];
  total: number;
  page: number;
  pageCount: number;
  filters: ListFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const canWrite = canManageShifts(primaryRole);

  const pushFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const qs = buildShiftsListQueryString({
        status: merged.status ? [merged.status] : undefined,
        unfilled: merged.unfilled,
        page: merged.page,
      });
      startTransition(() => {
        router.push(`/shifts${qs}`);
      });
    },
    [filters, router],
  );

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Shifts"
      subtitle={`${total} shift${total === 1 ? "" : "s"}`}
      headerAction={
        canWrite ? (
          <Link
            href="/staffing-requests/new"
            className="inline-flex items-center min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
          >
            New staffing request
          </Link>
        ) : null
      }
    >
      <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-ink-100 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Status</span>
            <select
              aria-label="Status"
              value={filters.status}
              onChange={(e) => pushFilters({ status: e.target.value, page: 1 })}
              className="mt-1 block w-full min-w-[140px] h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="matching">Matching</option>
              <option value="partially_filled">Partially filled</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="flex items-center gap-2 h-11 text-[13px] text-ink-700">
            <input
              type="checkbox"
              aria-label="Unfilled only"
              checked={filters.unfilled || searchParams.get("unfilled") === "1"}
              onChange={(e) => pushFilters({ unfilled: e.target.checked, page: 1 })}
            />
            Unfilled only
          </label>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[15px] font-medium tracking-tight">No shifts yet</p>
            <p className="mt-1 text-[13px] text-ink-500">
              Shifts are created when you publish staffing requests.
            </p>
            {canWrite ? (
              <Link
                href="/staffing-requests/new"
                className="inline-flex mt-4 items-center min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium"
              >
                Create staffing request
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b border-ink-100 bg-ink-50/50">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Shift</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Request</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Facility</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Window</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Filled</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-ink-50 hover:bg-ink-50/40 ${item.isUrgent ? "bg-amber-50/60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/shifts/${item.id}`}
                          className="font-mono text-[12px] hover:text-teal-700"
                        >
                          {shortShiftId(item.id)}
                          {item.shiftType ? ` · ${item.shiftType}` : ""}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/staffing-requests/${item.requestId}`}
                          className="hover:text-teal-700"
                        >
                          {item.requestTitle}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{item.facilityName}</td>
                      <td className="px-4 py-3 text-ink-600">
                        {formatShiftWindow(new Date(item.startAt), new Date(item.endAt))}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px]">
                        {item.filledCount} / {item.requiredCount}
                      </td>
                      <td className="px-4 py-3">
                        <ShiftStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {formatRelativeTime(item.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-ink-100">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/shifts/${item.id}`}
                  className={`block p-4 hover:bg-ink-50/40 ${item.isUrgent ? "bg-amber-50/60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium tracking-tight">{item.requestTitle}</p>
                      <p className="text-[12px] text-ink-500 mt-0.5">{item.facilityName}</p>
                    </div>
                    <ShiftStatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-[12px] text-ink-600">
                    {item.filledCount}/{item.requiredCount} filled
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {pageCount > 1 ? (
          <div className="p-4 border-t border-ink-100 flex justify-between items-center text-[13px]">
            <button
              type="button"
              disabled={page <= 1 || pending}
              onClick={() => pushFilters({ page: page - 1 })}
              className="h-9 px-3 rounded-md border border-ink-200 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-ink-500">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount || pending}
              onClick={() => pushFilters({ page: page + 1 })}
              className="h-9 px-3 rounded-md border border-ink-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </AgencyShell>
  );
}
