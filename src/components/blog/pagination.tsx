// components/blog/Pagination.tsx
import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={page === 1 ? "/blog" : `/blog?page=${page}`}
            aria-current={isCurrent ? "page" : undefined}
            className={[
              "min-w-9 rounded border px-3 py-1 text-sm text-center",
              isCurrent
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
