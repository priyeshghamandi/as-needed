export function ProfileFulfillmentNotice({ agencyName }: { agencyName: string }) {
  return (
    <section className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-4 text-[14px] text-ink-700 leading-relaxed print:border print:bg-white">
      Staffing fulfilled by <span className="font-medium">{agencyName}</span> coordinators.
      Submit a staffing request to request this professional — not a direct hire.
    </section>
  );
}
