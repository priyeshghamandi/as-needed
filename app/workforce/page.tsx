import { Suspense } from "react";
import { parseWorkforceListParams } from "@/lib/workforce/list-filters";
import { loadWorkforcePageContext } from "@/lib/workforce/load-page-context";
import { getWorkforceList } from "@/lib/workforce/queries";
import { WorkforceListClient } from "@/components/workforce/workforce-list-client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WorkforcePage({ searchParams }: PageProps) {
  const ctx = await loadWorkforcePageContext();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseWorkforceListParams(sp);
  const result = await getWorkforceList(ctx.agencyId, params);

  const items = result.items.map((item) => ({
    ...item,
    lastShiftAt: item.lastShiftAt?.toISOString() ?? null,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading workforce…</div>}>
    <WorkforceListClient
      agencyName={ctx.agencyName}
      userName={ctx.userName}
      userInitials={ctx.userInitials}
      primaryRole={ctx.primaryRole}
      items={items}
      total={result.total}
      page={result.page}
      pageCount={result.pageCount}
      filters={{
        q: params.q ?? "",
        role: params.role ?? "",
        availability: params.availability ?? "",
        compliance: params.compliance ?? "",
        active: params.active !== false,
        sort: params.sort ?? "name",
        page: result.page,
      }}
    />
    </Suspense>
  );
}
