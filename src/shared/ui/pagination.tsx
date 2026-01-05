"use client";

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  className?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className={[
        "mt-12 flex flex-wrap items-center justify-center gap-2",
        className ?? "",
      ].join(" ")}
    >
      {/* Previous */}
      <Link
        href={`${basePath}?page=${Math.max(1, currentPage - 1)}`}
        aria-disabled={currentPage === 1}
        className={[
          "px-3 py-2 text-sm font-medium rounded-md border",
          currentPage === 1
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted",
        ].join(" ")}
      >
        Prev
      </Link>

      {/* Page numbers */}
      {pages.map((page) => {
        const isActive = page === currentPage;

        return (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            aria-current={isActive ? "page" : undefined}
            className={[
              "px-3 py-2 text-sm font-medium rounded-md border",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted",
            ].join(" ")}
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      <Link
        href={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}`}
        aria-disabled={currentPage === totalPages}
        className={[
          "px-3 py-2 text-sm font-medium rounded-md border",
          currentPage === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:bg-muted",
        ].join(" ")}
      >
        Next
      </Link>
    </nav>
  );
}
