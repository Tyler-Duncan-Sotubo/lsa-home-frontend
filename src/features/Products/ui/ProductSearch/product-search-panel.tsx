"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { searchProductsQuickAction } from "@/features/Products/actions/search-products";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import { useCanSeePrice } from "@/shared/hooks/use-can-see-price";
import { FaMagnifyingGlass } from "react-icons/fa6";

type QuickProduct = {
  id: string | number;
  name?: string;
  title?: string;
  slug?: string;
  href?: string;
  images?: Array<{ src?: string; url?: string; alt?: string }>;
  image?: { src?: string; url?: string; alt?: string };
  price?: string;
  priceHtml?: string;
  price_html?: string;
  regularPrice?: string;
  regular_price?: string;
  salePrice?: string;
  sale_price?: string;
};

function slugToQuery(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProductSearchPanel({
  placeholder = "Search products…",
  initialQuery,
}: {
  placeholder?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // pricing visibility + formatter (same as HeaderSearch)
  const { canSee, rule, isLoggedIn, priceRange } = useCanSeePrice();
  const formatPrice = usePriceDisplay();

  const inferredSlug = pathname?.includes("/products/")
    ? pathname.split("/products/")[1]
    : "";

  const inferredQuery = inferredSlug ? slugToQuery(inferredSlug) : "";

  const [q, setQ] = React.useState(initialQuery ?? inferredQuery ?? "");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<QuickProduct[]>([]);
  const [touched, setTouched] = React.useState(false);
  const lastReqId = React.useRef(0);

  // autofocus for 404 recovery UX
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // debounce search
  React.useEffect(() => {
    const query = q.trim();

    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = ++lastReqId.current;

    const t = window.setTimeout(async () => {
      try {
        const data = (await searchProductsQuickAction(query)) as QuickProduct[];
        if (id === lastReqId.current)
          setResults(Array.isArray(data) ? data : []);
      } catch {
        if (id === lastReqId.current) setResults([]);
      } finally {
        if (id === lastReqId.current) setLoading(false);
      }
    }, 200);

    return () => window.clearTimeout(t);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const viewAll = () => {
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const getLabel = (p: QuickProduct) => p.name ?? p.title ?? "Product";
  const getHref = (p: QuickProduct) =>
    p.href ?? (p.slug ? `/products/${p.slug}` : "#");

  const getImg = (p: QuickProduct) => {
    const fromImages = p.images?.[0]?.src ?? p.images?.[0]?.url;
    const fromImage = p.image?.src ?? p.image?.url;
    return fromImages ?? fromImage ?? "";
  };

  const getAlt = (p: QuickProduct) =>
    p.images?.[0]?.alt ?? p.image?.alt ?? getLabel(p);

  const PriceNode = ({ p }: { p: QuickProduct }) => {
    if (!canSee) {
      if (rule === "loggedInOnly" && !isLoggedIn) {
        return (
          <p className="text-[11px] text-muted-foreground">
            Login to see pricing.
          </p>
        );
      }
      return (
        <p className="text-[11px] text-muted-foreground">
          Pricing available via quote.
        </p>
      );
    }

    const priceHtml = p.priceHtml ?? p.price_html;
    const regularPrice = p.regularPrice ?? p.regular_price ?? p.price;
    const salePrice = p.salePrice ?? p.sale_price;

    const priceHtmlFormatted = formatPrice(priceHtml);
    const regularFormatted = formatPrice(regularPrice);
    const saleFormatted = formatPrice(salePrice);

    const pricePrefix = priceRange ? "From " : "";

    return priceHtmlFormatted ? (
      <p className="text-xs font-semibold text-foreground">
        {pricePrefix}
        {priceHtmlFormatted}
      </p>
    ) : saleFormatted && regularFormatted ? (
      <div className="flex items-center gap-2 text-xs">
        <span className="line-through text-muted-foreground">
          {regularFormatted}
        </span>
        <span className="text-primary font-semibold">
          {pricePrefix}
          {saleFormatted}
        </span>
      </div>
    ) : regularFormatted ? (
      <p className="text-xs font-semibold text-foreground">
        {pricePrefix}
        {regularFormatted}
      </p>
    ) : null;
  };

  const showEmpty = touched && !loading && q.trim() && results.length === 0;

  return (
    <div className="rounded-2xl border bg-background p-5 md:p-6">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <FaMagnifyingGlass className="h-4 w-4 text-muted-foreground" />
        Find the right product
      </div>

      {inferredSlug ? (
        <p className="mt-1 text-xs text-muted-foreground">
          We couldn’t find that URL. Try searching for{" "}
          <span className="font-medium text-foreground">“{inferredQuery}”</span>
          .
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setTouched(true);
          }}
          placeholder={placeholder}
          className="h-11"
        />
        <Button type="submit" className="h-11 px-4">
          Search
        </Button>
      </form>

      {/* Results */}
      <div className="mt-4">
        {loading ? (
          <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            Searching…
          </div>
        ) : results.length ? (
          <div className="overflow-hidden rounded-xl border">
            <ul className="divide-y">
              {results.map((p) => {
                const href = getHref(p);
                const img = getImg(p);
                const label = getLabel(p);

                return (
                  <li key={p.id}>
                    <Link
                      href={href}
                      className="flex items-center gap-3 p-3 hover:bg-muted"
                    >
                      {img ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={img}
                            alt={getAlt(p)}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {label}
                        </div>
                        <PriceNode p={p} />
                      </div>

                      <span className="text-xs text-muted-foreground">
                        View
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t p-2">
              <Button
                variant="link"
                type="button"
                className="w-full text-sm underline underline-offset-4"
                onClick={viewAll}
              >
                View all results
              </Button>
            </div>
          </div>
        ) : showEmpty ? (
          <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            No matching products found. Try fewer words or a different spelling.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Start typing to see results.
          </div>
        )}
      </div>
    </div>
  );
}
