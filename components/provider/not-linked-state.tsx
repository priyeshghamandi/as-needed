export function NotLinkedState() {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 text-center shadow-card">
      <h2 className="text-lg font-medium text-ink-900">Account not linked</h2>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">
        Your login is not connected to a healthcare professional profile yet. Contact
        your agency coordinator to complete linking before you can view shifts or set
        availability.
      </p>
    </div>
  );
}
