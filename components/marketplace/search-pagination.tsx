import Link from "next/link";

function pageHref(basePath: string, searchParams: URLSearchParams, targetPage: number): string {
  const params = new URLSearchParams(searchParams.toString());
  if (targetPage <= 1) params.delete("page");
  else params.set("page", String(targetPage));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function SearchPagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: URLSearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-between gap-4 text-[13px]"
      aria-label="Search results pagination"
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, searchParams, page - 1)}
          className="text-teal-800 hover:underline"
        >
          ← Previous
        </Link>
      ) : (
        <span className="text-ink-400">← Previous</span>
      )}
      <span className="text-ink-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={pageHref(basePath, searchParams, page + 1)}
          className="text-teal-800 hover:underline"
        >
          Next →
        </Link>
      ) : (
        <span className="text-ink-400">Next →</span>
      )}
    </nav>
  );
}
