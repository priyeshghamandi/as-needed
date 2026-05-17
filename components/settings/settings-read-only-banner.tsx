export function SettingsReadOnlyBanner() {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950"
    >
      <span className="font-medium">View only.</span>{" "}
      Only agency owners and admins can change these settings.
    </div>
  );
}
