"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/primitives";
import { AgencyShell } from "@/components/agency-shell";
import { ComplianceAddDialog, type ProfessionalOption } from "@/components/compliance/compliance-add-dialog";
import { ComplianceDetailPanel } from "@/components/compliance/compliance-detail-panel";
import { buildListQueryString } from "@/lib/compliance/list-filters";
import {
  CredentialStatusBadge,
  formatVerifiedAt,
} from "@/lib/compliance/compliance-ui";
import { CREDENTIAL_STATUSES } from "@/lib/validations/credential";
import type { ComplianceKpis, CredentialDetail, CredentialListItem } from "@/lib/compliance/queries";

type ListFilters = {
  q: string;
  status: string;
  expiry: string;
  page: number;
};

export function ComplianceListClient({
  agencyName,
  userName,
  userInitials,
  primaryRole,
  items,
  total,
  page,
  pageCount,
  kpis,
  filters,
  professionals,
}: {
  agencyName: string;
  userName: string;
  userInitials: string;
  primaryRole: string;
  items: CredentialListItem[];
  total: number;
  page: number;
  pageCount: number;
  kpis: ComplianceKpis;
  filters: ListFilters;
  professionals: ProfessionalOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CredentialDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void fetch(`/api/compliance/credentials/${selectedId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json() as Promise<CredentialDetail>;
      })
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetail(null);
          setSelectedId(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const pushFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const qs = buildListQueryString({
        q: merged.q || undefined,
        status: merged.status ? [merged.status as (typeof CREDENTIAL_STATUSES)[number]] : undefined,
        expiry:
          merged.expiry === "expired" ||
          merged.expiry === "next_30_days" ||
          merged.expiry === "next_90_days" ||
          merged.expiry === "no_expiry"
            ? merged.expiry
            : undefined,
        page: merged.page,
      });
      startTransition(() => router.push(`/compliance${qs}`));
    },
    [filters, router],
  );

  const headerAction = (
    <button
      type="button"
      onClick={() => setAddOpen(true)}
      className="inline-flex items-center gap-1.5 min-h-11 h-11 px-4 rounded-full bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-800"
    >
      <Icon name="plus" className="w-3.5 h-3.5" />
      Add credential
    </button>
  );

  return (
    <AgencyShell
      agencyName={agencyName}
      userName={userName}
      userInitials={userInitials}
      primaryRole={primaryRole}
      title="Compliance"
      subtitle="Track credentials and license status across your workforce."
      headerAction={headerAction}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Pending review" value={kpis.pendingReview} />
        <KpiCard label="Expiring soon" value={kpis.expiringSoon} />
        <KpiCard label="Expired" value={kpis.expired} />
        <KpiCard label="Verified" value={kpis.verified} />
      </div>

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
                placeholder="Search name, license, or professional"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-ink-200 text-[13px] focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    pushFilters({ q: (e.target as HTMLInputElement).value, page: 1 });
                  }
                }}
              />
            </div>
          </label>
          <label>
            <span className="block text-[11px] font-mono text-ink-500 mb-1">Status</span>
            <select
              value={filters.status}
              onChange={(e) => pushFilters({ status: e.target.value, page: 1 })}
              className="h-10 px-3 rounded-lg border border-ink-200 text-[13px] min-w-[160px]"
            >
              <option value="">All statuses</option>
              {CREDENTIAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "pending_review"
                    ? "Pending review"
                    : s === "expiring_soon"
                      ? "Expiring soon"
                      : s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-[11px] font-mono text-ink-500 mb-1">Expiry</span>
            <select
              value={filters.expiry}
              onChange={(e) => pushFilters({ expiry: e.target.value, page: 1 })}
              className="h-10 px-3 rounded-lg border border-ink-200 text-[13px] min-w-[160px]"
            >
              <option value="">Any expiry</option>
              <option value="next_30_days">Next 30 days</option>
              <option value="next_90_days">Next 90 days</option>
              <option value="expired">Expired</option>
              <option value="no_expiry">No expiry date</option>
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[14px] text-ink-600">No credentials match your filters.</p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-3 text-[13px] text-teal-700 hover:underline"
            >
              Add a credential
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50 text-[11px] font-mono uppercase text-ink-500">
                  <th className="px-4 py-3 font-medium">Professional</th>
                  <th className="px-4 py-3 font-medium">Credential</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">License #</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">Authority</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Verified</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-ink-50 hover:bg-teal-50/30 cursor-pointer ${
                      selectedId === row.id ? "bg-teal-50/50" : ""
                    } ${pending ? "opacity-70" : ""}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/workforce/${row.professionalId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-ink-900 hover:text-teal-800"
                      >
                        {row.professionalName}
                      </Link>
                      <div className="text-[11px] font-mono text-ink-500">
                        {row.professionalRole.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-600">{row.type}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-[12px]">
                      {row.licenseNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-ink-600">
                      {row.issuingAuthority ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">{row.expiresDisplay}</td>
                    <td className="px-4 py-3">
                      <CredentialStatusBadge
                        status={row.status}
                        displayBadge={row.displayBadge}
                      />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-[12px] text-ink-500">
                      {formatVerifiedAt(row.verifiedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 ? (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 text-[12px]">
            <span className="text-ink-500 font-mono">
              {total} credential{total === 1 ? "" : "s"} · page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || pending}
                onClick={() => pushFilters({ page: page - 1 })}
                className="h-8 px-3 rounded-full border border-ink-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pageCount || pending}
                onClick={() => pushFilters({ page: page + 1 })}
                className="h-8 px-3 rounded-full border border-ink-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {addOpen ? (
        <ComplianceAddDialog
          professionals={professionals}
          onClose={() => setAddOpen(false)}
          onCreated={refresh}
        />
      ) : null}

      {selectedId && detail && !detailLoading ? (
        <ComplianceDetailPanel
          detail={detail}
          onClose={() => setSelectedId(null)}
          onChanged={() => {
            refresh();
            void fetch(`/api/compliance/credentials/${selectedId}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => d && setDetail(d as CredentialDetail));
          }}
        />
      ) : null}

      {selectedId && detailLoading ? (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-ink-200 shadow-xl flex items-center justify-center">
          <p className="text-[13px] text-ink-500">Loading…</p>
        </div>
      ) : null}
    </AgencyShell>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-4 py-3">
      <p className="text-[11px] font-mono uppercase text-ink-500">{label}</p>
      <p className="mt-1 text-[24px] font-medium tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
