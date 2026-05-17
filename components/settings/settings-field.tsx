export function SettingsField({
  label,
  sub,
  error,
  children,
}: {
  label: string;
  sub?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[12px] font-medium tracking-tight text-ink-800">{label}</span>
        {sub ? <span className="text-[10px] font-mono text-ink-500">{sub}</span> : null}
      </div>
      {children}
      {error ? <p className="mt-1 text-[11px] font-mono text-rose-600">{error}</p> : null}
    </label>
  );
}

export function SettingsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-10 px-3 rounded-lg border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:bg-ink-50 disabled:text-ink-500 ${props.className ?? ""}`}
    />
  );
}

export function SettingsTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-ink-200 bg-white text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:bg-ink-50 disabled:text-ink-500 ${props.className ?? ""}`}
    />
  );
}

export function SettingsSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full h-10 px-3 rounded-lg border border-ink-200 bg-white text-[13px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:bg-ink-50 disabled:text-ink-500 ${props.className ?? ""}`}
    />
  );
}
