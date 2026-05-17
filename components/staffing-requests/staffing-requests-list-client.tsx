"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { canManageStaffingRequests } from "@/lib/auth/staffing-requests-access-rules";
import { buildListQueryString } from "@/lib/staffing-requests/list-filters";
import {
  formatRelativeTime,
  PriorityBadge,
  roleNeededLabel,
  StatusBadge,
} from "@/lib/staffing-requests/staffing-requests-ui";
import { formatShiftWindow } from "@/lib/staffing-requests/shift-datetime";

export type SerializedStaffingRequestListItem = {
  id: string;
  title: string;
  facilityName: string;
  roleNeeded: string;
  shiftStartAt: string | null;
  shiftEndAt: string | null;
  professionalsRequired: number;
  filledCount: number;
  priority: string;
  status: string;
  coordinatorName: string | null;
  updatedAt: string;
};

type ListFilters = {
  q: string;
  status: string;
  facilityId: string;
  priority: string;
  page: number;
};

export function StaffingRequestsListClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  items,
  total,
  page,
  pageCount,
  filters,
  facilities,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  items: SerializedStaffingRequestListItem[];
  total: number;
  page: number;
  pageCount: number;
  filters: ListFilters;
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [forbiddenToast, setForbiddenToast] = useState<string | null>(null);
  const canWrite = canManageStaffingRequests(primaryRole);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setForbiddenToast("You do not have permission to create staffing requests.");
      router.replace("/staffing-requests");
    }
  }, [searchParams, router]);

  const pushFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const qs = buildListQueryString({
        q: merged.q || undefined,
        status: merged.status ? [merged.status] : undefined,
        facilityId: merged.facilityId || undefined,
        priority: merged.priority || undefined,
        page: merged.page,
      });
      startTransition(() => {
        router.push(`/staffing-requests${qs}`);
      });
    },
    [filters, router],
  );

  const headerAction = canWrite ? (
    <Link
      href="/staffing-requests/new"
      className="inline-flex items-center gap-1.5 min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
    >
      <Icon name="plus" className="w-3.5 h-3.5" />
      New staffing request
    </Link>
  ) : null;

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Staffing Requests"
      subtitle={`${total} request${total === 1 ? "" : "s"}`}
      headerAction={headerAction}
    >
      {forbiddenToast ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
        >
          {forbiddenToast}
        </div>
      ) : null}

      <div className="rounded-xl border border-ink-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-ink-100 flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex-1 min-w-0">
            <span className="sr-only">Search</span>
            <input
              placeholder="Search title or facility"
              defaultValue={filters.q}
              className="w-full h-11 px-3 rounded-lg border border-ink-200 text-[14px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushFilters({ q: (e.target as HTMLInputElement).value, page: 1 });
                }
              }}
            />
          </label>
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
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-mono text-ink-500 uppercase tracking-wider">Facility</span>
            <select
              aria-label="Facility"
              value={filters.facilityId}
              onChange={(e) => pushFilters({ facilityId: e.target.value, page: 1 })}
              className="mt-1 block w-full min-w-[160px] h-11 px-3 rounded-lg border border-ink-200 text-[14px] bg-white"
            >
              <option value="">All facilities</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[15px] font-medium tracking-tight">No staffing requests yet</p>
            <p className="mt-1 text-[13px] text-ink-500">
              Create a request to start filling shifts at your facilities.
            </p>
            {canWrite ? (
              <Link
                href="/staffing-requests/new"
                className="inline-flex mt-4 items-center gap-1.5 min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium"
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
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Request
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Facility
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Role
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Shift window
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Filled
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Priority
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium text-ink-600">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-ink-50 hover:bg-ink-50/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/staffing-requests/${item.id}`}
                          className="font-medium tracking-tight hover:text-teal-700"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{item.facilityName}</td>
                      <td className="px-4 py-3">{roleNeededLabel(item.roleNeeded)}</td>
                      <td className="px-4 py-3 text-ink-600">
                        {item.shiftStartAt && item.shiftEndAt
                          ? formatShiftWindow(
                              new Date(item.shiftStartAt),
                              new Date(item.shiftEndAt),
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px]">
                        {item.filledCount} / {item.professionalsRequired}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
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
                  href={`/staffing-requests/${item.id}`}
                  className="block p-4 hover:bg-ink-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium tracking-tight">{item.title}</div>
                      <div className="text-[12px] text-ink-500 mt-0.5">{item.facilityName}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-ink-600">
                    <span>{roleNeededLabel(item.roleNeeded)}</span>
                    <span>
                      {item.filledCount}/{item.professionalsRequired} filled
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
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
