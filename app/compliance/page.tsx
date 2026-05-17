import { Suspense } from "react";
import { ComplianceListClient } from "@/components/compliance/compliance-list-client";
import { loadCompliancePageContext } from "@/lib/compliance/load-page-context";
import { parseComplianceListParams } from "@/lib/compliance/list-filters";
import { listCredentials, listProfessionalsForCombobox } from "@/lib/compliance/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompliancePage({ searchParams }: PageProps) {
  const ctx = await loadCompliancePageContext();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseComplianceListParams(sp);
  const [result, pros] = await Promise.all([
    listCredentials(ctx.agencyId, params),
    listProfessionalsForCombobox(ctx.agencyId),
  ]);

  const professionals = pros.map((p) => ({
    id: p.id,
    label: `${p.firstName} ${p.lastName}`,
    role: p.role,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading compliance…</div>}>
      <ComplianceListClient
        agencyName={ctx.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        primaryRole={ctx.primaryRole}
        items={result.items}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        kpis={result.kpis}
        filters={{
          q: params.q ?? "",
          status: params.status?.[0] ?? "",
          expiry: params.expiry ?? "",
          page: result.page,
        }}
        professionals={professionals}
      />
    </Suspense>
  );
}
