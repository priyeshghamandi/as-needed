import { Icon } from "@/components/primitives";
import type { ChecklistItem } from "@/lib/marketplace/visibility-checklist";

const BLOCKED_LABELS: Record<string, string> = {
  compliance_expired: "Blocked — compliance",
  profile_incomplete: "Blocked — incomplete profile",
  location_out_of_area: "Blocked — location",
  manual_admin_block: "Blocked — admin",
};

export function MarketplaceVisibilityChecklist({
  items,
  blockReason,
}: {
  items: ChecklistItem[];
  blockReason: string | null;
}) {
  return (
    <div className="space-y-3">
      {blockReason ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
        >
          {BLOCKED_LABELS[blockReason] ?? `Blocked — ${blockReason}`}
        </div>
      ) : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 text-[13px]"
            data-checklist-id={item.id}
            data-passed={item.passed ? "true" : "false"}
          >
            <Icon
              name={item.passed ? "check-circle" : "x-circle"}
              className={`w-4 h-4 mt-0.5 shrink-0 ${item.passed ? "text-teal-600" : "text-rose-500"}`}
            />
            <span>
              <span className={item.passed ? "text-ink-800" : "text-ink-600"}>{item.label}</span>
              {item.detail && !item.passed ? (
                <span className="block text-[12px] text-ink-500 mt-0.5">{item.detail}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
