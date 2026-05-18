"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Icon, Avatar } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { buildListQueryString } from "@/lib/workforce/list-filters";
import {
  AvailabilityBadge,
  ComplianceBadge,
  formatRelativeTime,
  roleLabel,
  ShiftReadinessBadge,
} from "@/lib/workforce/workforce-ui";
import { canManageWorkforce } from "@/lib/auth/workforce-access-rules";
import { WorkforceBulkMarketplaceModal } from "@/components/workforce/workforce-bulk-marketplace-modal";
import type { ComplianceStatus, ShiftReadiness } from "@/lib/workforce/shift-readiness";

export type SerializedWorkforceListItem = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialty: string | null;
  city: string | null;
  state: string | null;
  availabilityStatus: string;
  reliabilityScore: number | null;
  complianceStatus: ComplianceStatus;
  currentAssignment: string | null;
  lastShiftAt: string | null;
  shiftReadiness: ShiftReadiness;
};

type ListFilters = {
  q: string;
  role: string;
  availability: string;
  compliance: string;
  active: boolean;
  sort: string;
  page: number;
};

export function WorkforceListClient({
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
  items: SerializedWorkforceListItem[];
  total: number;
  page: number;
  pageCount: number;
  filters: ListFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [forbiddenToast, setForbiddenToast] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkModal, setBulkModal] = useState<"show" | "hide" | null>(null);
  const canWrite = canManageWorkforce(primaryRole);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 50 ? [...prev, id] : prev,
    );
  };

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setForbiddenToast("You do not have permission to add professionals.");
      router.replace("/workforce");
    }
  }, [searchParams, router]);

  const pushFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const qs = buildListQueryString({
        q: merged.q || undefined,
        role: merged.role || undefined,
        availability: merged.availability || undefined,
        compliance:
          merged.compliance === "clear" ||
          merged.compliance === "attention" ||
          merged.compliance === "blocked"
            ? merged.compliance
            : undefined,
        active: merged.active,
        sort: merged.sort as "name" | "reliability" | "updated",
        page: merged.page,
      });
      startTransition(() => {
        router.push(`/workforce${qs}`);
      });
    },
    [filters, router],
  );

  const headerAction = canWrite ? (
    <Link
      href="/workforce/new"
      className="inline-flex items-center gap-1.5 min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
    >
      <Icon name="user-plus" className="w-3.5 h-3.5" />
      Add professional
    </Link>
  ) : null;

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Workforce"
      subtitle={`${total} healthcare professional${total === 1 ? "" : "s"}`}
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
                placeholder="Search name or email"
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
              aria-label="Role"
              defaultValue={filters.role}
              className="h-10 px-2 rounded-lg border border-ink-200 text-[13px] bg-white"
              onChange={(e) => pushFilters({ role: e.target.value, page: 1 })}
            >
              <option value="">All roles</option>
              {["rn", "cna", "emt", "lpn", "cnm", "cns", "other"].map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
            <select
              aria-label="Availability"
              defaultValue={filters.availability}
              className="h-10 px-2 rounded-lg border border-ink-200 text-[13px] bg-white"
              onChange={(e) => pushFilters({ availability: e.target.value, page: 1 })}
            >
              <option value="">All availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="on_shift">On shift</option>
              <option value="pending_confirmation">Pending</option>
            </select>
            <select
              aria-label="Compliance"
              defaultValue={filters.compliance}
              className="h-10 px-2 rounded-lg border border-ink-200 text-[13px] bg-white"
              onChange={(e) => pushFilters({ compliance: e.target.value, page: 1 })}
            >
              <option value="">All compliance</option>
              <option value="clear">Clear</option>
              <option value="attention">Attention</option>
              <option value="blocked">Blocked</option>
            </select>
            <label className="inline-flex items-center gap-2 h-10 px-2 text-[13px] text-ink-700">
              <input
                type="checkbox"
                defaultChecked={!filters.active}
                onChange={(e) => pushFilters({ active: !e.target.checked, page: 1 })}
              />
              Show inactive
            </label>
          </div>
        </div>

        {pending ? (
          <div className="px-5 py-8 text-center text-[13px] font-mono text-ink-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Icon name="users" className="w-8 h-8 text-ink-300 mx-auto mb-3" />
            <div className="text-[14px] font-medium text-ink-700">No healthcare professionals yet</div>
            {canWrite ? (
              <Link
                href="/workforce/new"
                className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-ink-900 text-paper text-[13px] hover:bg-ink-800"
              >
                <Icon name="user-plus" className="w-3.5 h-3.5" />
                Add professional
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {canWrite && selectedIds.length > 0 ? (
              <div className="px-4 py-3 border-b border-ink-100 flex flex-wrap items-center gap-2 bg-ink-50/50">
                <span className="text-[13px] text-ink-700">{selectedIds.length} selected</span>
                <button
                  type="button"
                  className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-white"
                  onClick={() => setBulkModal("show")}
                >
                  Show on marketplace
                </button>
                <button
                  type="button"
                  className="h-8 px-3 rounded-md border border-ink-200 text-[12px] hover:bg-white"
                  onClick={() => setBulkModal("hide")}
                >
                  Hide from marketplace
                </button>
                <button
                  type="button"
                  className="h-8 px-3 text-[12px] text-ink-500"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </button>
              </div>
            ) : null}
            <div className="md:hidden divide-y divide-ink-100">
              {items.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/workforce/${p.id}`}
                  className="block px-4 py-3.5 space-y-2 min-h-11 hover:bg-ink-50/50"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      initials={`${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`}
                      tone={(["teal", "violet", "amber", "rose", "ink"] as const)[i % 5]}
                      size={26}
                    />
                    <span className="font-medium tracking-tight">
                      {p.firstName} {p.lastName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[12px]">
                    <span>{roleLabel(p.role)}</span>
                    <AvailabilityBadge status={p.availabilityStatus} />
                    <ComplianceBadge status={p.complianceStatus} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-ink-500 border-b border-ink-100">
                    {canWrite ? (
                      <th scope="col" className="px-3 py-2 font-medium w-10">
                        <span className="sr-only">Select</span>
                      </th>
                    ) : null}
                    <th scope="col" className="px-5 py-2 font-medium">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Specialty
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Location
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Availability
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden xl:table-cell">
                      Assignment
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Compliance
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Reliability
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium hidden lg:table-cell">
                      Last shift
                    </th>
                    <th scope="col" className="px-3 py-2 font-medium">
                      Readiness
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, i) => (
                    <tr key={p.id} className="border-b border-ink-100 hover:bg-ink-50/40">
                      {canWrite ? (
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            aria-label={`Select ${p.firstName} ${p.lastName}`}
                            checked={selectedIds.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                          />
                        </td>
                      ) : null}
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={`${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`}
                            tone={(["teal", "violet", "amber", "rose", "ink"] as const)[i % 5]}
                            size={26}
                          />
                          <Link
                            href={`/workforce/${p.id}`}
                            className="font-medium tracking-tight hover:text-teal-700"
                          >
                            {p.firstName} {p.lastName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">{roleLabel(p.role)}</td>
                      <td className="px-3 py-2.5 text-ink-600 hidden lg:table-cell">
                        {p.specialty ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-mono text-ink-600 hidden lg:table-cell">
                        {p.city && p.state ? `${p.city}, ${p.state}` : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <AvailabilityBadge status={p.availabilityStatus} />
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-ink-600 hidden xl:table-cell">
                        {p.currentAssignment ?? "Unassigned"}
                      </td>
                      <td className="px-3 py-2.5">
                        <ComplianceBadge status={p.complianceStatus} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px] hidden lg:table-cell">
                        {p.reliabilityScore ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-mono text-ink-500 hidden lg:table-cell">
                        {formatRelativeTime(p.lastShiftAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <ShiftReadinessBadge readiness={p.shiftReadiness} />
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

      {bulkModal && selectedIds.length > 0 ? (
        <WorkforceBulkMarketplaceModal
          professionalIds={selectedIds}
          isMarketplaceVisible={bulkModal === "show"}
          onClose={() => {
            setBulkModal(null);
            setSelectedIds([]);
          }}
        />
      ) : null}
    </AgencyShell>
  );
}
