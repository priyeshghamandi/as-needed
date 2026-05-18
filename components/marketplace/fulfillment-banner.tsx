export function FulfillmentBanner() {
  return (
    <div
      role="region"
      aria-label="Staffing fulfillment notice"
      className="bg-ink-50 border-b border-ink-200/80"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-2 text-center text-[12px] text-ink-600">
        Staffing is fulfilled by licensed agency coordinators — request a professional, not a
        direct hire.
      </div>
    </div>
  );
}
