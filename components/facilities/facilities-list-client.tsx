"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { buildListQueryString } from "@/lib/facilities/list-filters";
import {
  facilityTypeLabel,
  formatRelativeTime,
  PortalAccessBadge,
} from "@/lib/facilities/facilities-ui";
import { canManageFacilities } from "@/lib/auth/facilities-access-rules";
import { FACILITY_TYPES } from "@/lib/facilities/type-labels";
import type { PortalAccessStatus } from "@/lib/facilities/queries";

export type SerializedFacilityListItem = {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
  contactName: string | null;
  contactEmail: string | null;
  openRequestsCount: number;
  portalAccess: PortalAccessStatus;
  updatedAt: string;
};

type ListFilters = {
  q: string;
  type: string;
  state: string;
  sort: string;
  page: number;
};

export function FacilitiesListClient({
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
  items: SerializedFacilityListItem[];
  total: number;
  page: number;
  pageCount: number;
  filters: ListFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [forbiddenToast, setForbiddenToast] = useState<string | null>(null);
  const canWrite = canManageFacilities(primaryRole);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setForbiddenToast("You do not have permission to add facilities.");
      router.replace("/facilities");
    }
  }, [searchParams, router]);

  const pushFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const qs = buildListQueryString({
        q: merged.q || undefined,
        type: merged.type || undefined,
        state: merged.state || undefined,
        sort: merged.sort as "name" | "updated" | "city",
        page: merged.page,
      });
      startTransition(() => {
        router.push(`/facilities${qs}`);
      });
    },
    [filters, router],
  );

  const headerAction = canWrite ? (
    <Link
      href="/facilities/new"
      className="inline-flex items-center gap-1.5 min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
    >
      <Icon name="building-2" className="w-3.5 h-3.5" />
      Add facility
    </Link>
  ) : null;

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Facilities"
      subtitle={`${total} facilit${total === 1 ? "y" : "ies"}`}
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
            <div className="relative">
              <Icon
                name="search"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                type="search"
                defaultValue={filters.q}
                placeholder="Search name, contact, or city"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-ink-200 text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    pushFilters({ q: (e.target as HTMLInputElement).value, page: 1 });
                  }
                }}
              />
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Facility type"
              defaultValue={filters.type}
              className="h-10 px-2 rounded-lg border border-ink-200 text-[13px] bg-white"
              onChange={(e) => pushFilters({ type: e.target.value, page: 1 })}
            >
              <option value="">All types</option>
              {FACILITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {facilityTypeLabel(t)}
                </option>
              ))}
            </select>
            <input
              aria-label="State"
              placeholder="State"
              defaultValue={filters.state}
              className="h-10 w-24 px-2 rounded-lg border border-ink-200 text-[13px]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushFilters({ state: (e.target as HTMLInputElement).value, page: 1 });
                }
              }}
            />
          </div>
        </div>

        {pending ? (
          <div className="px-5 py-8 text-center text-[13px] font-mono text-ink-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Icon name="building-2" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
            <div className="text-[14px] font-medium text-ink-700">No facilities yet</div>
            {canWrite ? (
              <Link
                href="/facilities/new"
                className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] hover:bg-ink-800"
              >
                <Icon name="building-2" className="w-3.5 h-3.5" />
                Add facility
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-ink-100">
              {items.map((f) => (
                <Link
                  key={f.id}
                  href={`/facilities/${f.id}`}
                  className="block px-4 py-3.5 space-y-2 min-h-11 hover:bg-ink-50/50"
                >
                  <div className="font-medium tracking-tight">{f.name}</div>
                  <div className="flex flex-wrap gap-2 text-[12px] text-ink-600">
                    <span>{facilityTypeLabel(f.type)}</span>
                    <span>
                      {f.city && f.state ? `${f.city}, ${f.state}` : "—"}
                    </span>
                    <span>{f.openRequestsCount} open requests</span>
                    <PortalAccessBadge status={f.portalAccess} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                    <th scope="col" className="px-5 py-2 font-medium">
                      Facility
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Location
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden xl:table-cell">
                      Contact
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden md:table-cell">
                      Open requests
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Portal access
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((f) => (
                    <tr key={f.id} className="border-b border-ink-100 hover:bg-ink-50/40">
                      <td className="px-5 py-2.5">
                        <Link
                          href={`/facilities/${f.id}`}
                          className="font-medium tracking-tight hover:text-teal-700"
                        >
                          {f.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">{facilityTypeLabel(f.type)}</td>
                      <td className="px-3 py-2.5 text-[12px] font-mono text-ink-600 hidden lg:table-cell">
                        {f.city && f.state ? `${f.city}, ${f.state}` : "—"}
                      </td>
                      <td className="px-3 py-2.5 hidden xl:table-cell">
                        <div className="text-ink-800">{f.contactName ?? "—"}</div>
                        {f.contactEmail ? (
                          <div className="text-[11px] font-mono text-ink-500 truncate max-w-[180px]">
                            {f.contactEmail}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] hidden md:table-cell">
                        {f.openRequestsCount}
                      </td>
                      <td className="px-3 py-2.5">
                        <PortalAccessBadge status={f.portalAccess} />
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-mono text-ink-500 hidden lg:table-cell">
                        {formatRelativeTime(f.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1 ? (
              <div className="px-5 py-3 border-t border-ink-100 flex items-center justify-between text-[12px] font-mono text-ink-500">
                <span>
                  Page {page} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    className="px-2 h-8 rounded border border-ink-200 disabled:opacity-40"
                    onClick={() => pushFilters({ page: page - 1 })}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    className="px-2 h-8 rounded border border-ink-200 disabled:opacity-40"
                    onClick={() => pushFilters({ page: page + 1 })}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AgencyShell>
  );
}
