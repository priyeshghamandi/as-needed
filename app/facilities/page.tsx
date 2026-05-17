import { Suspense } from "react";
import { FacilitiesListClient } from "@/components/facilities/facilities-list-client";
import { parseFacilitiesListParams } from "@/lib/facilities/list-filters";
import { loadFacilitiesPageContext } from "@/lib/facilities/load-page-context";
import { getFacilitiesList } from "@/lib/facilities/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FacilitiesPage({ searchParams }: PageProps) {
  const ctx = await loadFacilitiesPageContext();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseFacilitiesListParams(sp);
  const result = await getFacilitiesList(ctx.agencyId, params);

  const items = result.items.map((item) => ({
    ...item,
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading facilities…</div>}>
      <FacilitiesListClient
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
          type: params.type ?? "",
          state: params.state ?? "",
          sort: params.sort ?? "name",
          page: result.page,
        }}
      />
    </Suspense>
  );
}
