import { Suspense } from "react";
import { ShiftsListClient } from "@/components/shifts/shifts-list-client";
import { parseShiftsListParams } from "@/lib/shifts/list-filters";
import { loadShiftsPageContext } from "@/lib/shifts/load-page-context";
import { getShiftsList } from "@/lib/shifts/queries";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShiftsPage({ searchParams }: PageProps) {
  const ctx = await loadShiftsPageContext();
  const raw = await searchParams;
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") sp.set(key, value);
  }
  const params = parseShiftsListParams(sp);
  const result = await getShiftsList(ctx.agencyId, params);

  const items = result.items.map((item) => ({
    ...item,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Loading shifts…</div>}>
      <ShiftsListClient
        agencyName={ctx.agencyName}
        userName={ctx.userName}
        userInitials={ctx.userInitials}
        primaryRole={ctx.primaryRole}
        items={items}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        filters={{
          status: params.status?.[0] ?? "",
          unfilled: params.unfilled ?? false,
          page: result.page,
        }}
      />
    </Suspense>
  );
}
