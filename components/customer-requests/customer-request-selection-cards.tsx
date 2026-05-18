import type { CustomerSelectionPreview } from "@/lib/customer-requests/create-customer-request";

export function CustomerRequestSelectionCards({
  items,
  onRemove,
  readOnly = false,
}: {
  items: CustomerSelectionPreview[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-6 text-[14px] text-ink-600">
        No professionals selected. Return to marketplace search to add professionals to your
        request.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-xl border bg-white p-4 flex gap-4 ${
            item.eligible ? "border-ink-200" : "border-amber-300 bg-amber-50/50"
          }`}
        >
          <div
            className="w-12 h-12 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center text-[13px] font-medium shrink-0"
            aria-hidden
          >
            {item.displayName
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium tracking-tight">{item.displayName}</p>
            <p className="text-[13px] text-ink-600">
              {item.roleLabel} · Staffing via {item.agencyName}
            </p>
            {!item.eligible ? (
              <p className="mt-2 text-[12px] text-amber-900">
                No longer available in your facility area — remove before submitting.
              </p>
            ) : null}
          </div>
          {!readOnly && onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-[12px] text-ink-500 hover:text-rose-700 shrink-0"
            >
              Remove
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
