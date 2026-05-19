import type { FulfillmentTimelineStep } from "@/lib/facility/fulfillment-timeline";
import { Icon } from "@/components/primitives";

export function FulfillmentTimeline({ steps }: { steps: FulfillmentTimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`w-7 h-7 rounded-full inline-flex items-center justify-center border ${
                step.complete
                  ? "bg-teal-600 border-teal-600 text-white"
                  : step.current
                    ? "border-teal-600 text-teal-700 bg-teal-50"
                    : "border-ink-200 text-ink-400 bg-white"
              }`}
            >
              {step.complete ? (
                <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={`w-px flex-1 min-h-[24px] ${step.complete ? "bg-teal-300" : "bg-ink-200"}`}
              />
            ) : null}
          </div>
          <div className="pb-6 pt-0.5">
            <p
              className={`text-[14px] font-medium ${
                step.complete || step.current ? "text-ink-900" : "text-ink-500"
              }`}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
