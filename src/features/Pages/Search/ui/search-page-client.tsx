/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { searchProductsPageAction } from "../actions/search-products-page";
import { ProductRail } from "../../Products/ui/product-rail";

export function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const perPage = 24;

  const [items, setItems] = useState<any[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchProductsPageAction(q, page, perPage)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items ?? []);
        setHasNext(!!res.hasNext);
        setHasPrev(!!res.hasPrev);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setHasNext(false);
        setHasPrev(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, page, perPage]);

  if (!q) {
    return (
      <section className="mx-auto w-[95%] py-10">
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="mt-2 text-muted-foreground">
          Type something to search for products.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-[95%] py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Search Results for <span>“{q}”</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          {items.length} result{items.length !== 1 ? "s" : ""} found
        </p>
      </header>

      {loading ? (
        <div className="text-sm text-muted-foreground">Searching…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border p-6">
          <p className="text-muted-foreground">No results found.</p>
          <Link
            href="/collections"
            className="mt-3 inline-block underline underline-offset-4"
          >
            Browse collections
          </Link>
        </div>
      ) : (
        <ProductRail products={items} layout="wrap" />
      )}

      {/* Pagination */}
      {items.length > 24 && (
        <div className="flex items-center justify-between pt-4">
          <button
            disabled={!hasPrev}
            onClick={() =>
              router.push(`/search?q=${encodeURIComponent(q)}&page=${page - 1}`)
            }
            className={[
              "rounded-lg border px-4 py-2 text-sm font-medium",
              !hasPrev ? "opacity-50 cursor-not-allowed" : "hover:bg-muted",
            ].join(" ")}
          >
            Previous
          </button>

          <button
            disabled={!hasNext}
            onClick={() =>
              router.push(`/search?q=${encodeURIComponent(q)}&page=${page + 1}`)
            }
            className={[
              "rounded-lg border px-4 py-2 text-sm font-medium",
              !hasNext ? "opacity-50 cursor-not-allowed" : "hover:bg-muted",
            ].join(" ")}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
