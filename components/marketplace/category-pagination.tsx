import Link from "next/link";

export function CategoryPagination({
  slug,
  page,
  totalPages,
}: {
  slug: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const base = `/marketplace/categories/${slug}`;

  return (
    <nav
      className="mt-8 flex items-center justify-between gap-4 text-[13px]"
      aria-label="Category results pagination"
    >
      {page > 1 ? (
        <Link
          href={page === 2 ? base : `${base}?page=${page - 1}`}
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
        <Link href={`${base}?page=${page + 1}`} className="text-teal-800 hover:underline">
          Next →
        </Link>
      ) : (
        <span className="text-ink-400">Next →</span>
      )}
    </nav>
  );
}
