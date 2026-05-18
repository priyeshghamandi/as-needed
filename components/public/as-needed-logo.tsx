import Link from "next/link";

export function AsNeededLogo({
  href = "/",
  badge,
}: {
  href?: string;
  badge?: "marketplace" | null;
}) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="relative w-7 h-7 rounded-lg bg-ink-900 inline-flex items-center justify-center">
        <span className="absolute inset-1.5 rounded-md ring-1 ring-paper/30" />
        <span className="block w-2 h-2 bg-teal-400 rounded-full" />
      </span>
      <span className="font-semibold tracking-tight text-[15px]">AsNeeded</span>
      {badge === "marketplace" ? (
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 ml-1 px-1.5 py-0.5 border border-teal-200 rounded bg-teal-50">
          marketplace
        </span>
      ) : null}
    </Link>
  );
}
