"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { HiOutlineXMark } from "react-icons/hi2";
import { searchProductsQuickAction } from "@/features/Products/actions/search-products";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import { useCanSeePrice } from "@/shared/hooks/use-can-see-price";

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

export function HeaderSearch({
  onClose,
  placeholder = "Search...",
}: {
  onClose: () => void;
  placeholder?: string;
}) {
  const router = useRouter();

  // ✅ pricing visibility + formatter
  const { canSee, rule, isLoggedIn } = useCanSeePrice();
  const formatPrice = usePriceDisplay();

  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // quick results
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<QuickProduct[]>([]);
  const lastReqId = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // autofocus
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // close on Esc
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // close dropdown on outside click
  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // debounce search -> server action
  React.useEffect(() => {
    const query = q.trim();

    if (!query) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    const id = ++lastReqId.current;

    const t = window.setTimeout(async () => {
      try {
        const data = (await searchProductsQuickAction(query)) as QuickProduct[];
        if (id === lastReqId.current) {
          setResults(Array.isArray(data) ? data : []);
        }
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
    onClose();
  };

  const viewAll = () => {
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
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
    // ✅ when user can't see prices, show the same rule-driven message
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

    // ✅ normalize fields from API response
    const priceHtml = p.priceHtml ?? p.price_html;
    const regularPrice = p.regularPrice ?? p.regular_price ?? p.price;
    const salePrice = p.salePrice ?? p.sale_price;

    const priceHtmlFormatted = formatPrice(priceHtml);
    const regularFormatted = formatPrice(regularPrice);
    const saleFormatted = formatPrice(salePrice);

    return priceHtmlFormatted ? (
      <p className="text-xs font-semibold text-foreground">
        {priceHtmlFormatted}
      </p>
    ) : saleFormatted && regularFormatted ? (
      <div className="flex items-center gap-2 text-xs">
        <span className="line-through text-muted-foreground">
          {regularFormatted}
        </span>
        <span className="text-primary font-semibold">{saleFormatted}</span>
      </div>
    ) : regularFormatted ? (
      <p className="text-xs font-semibold text-foreground">
        {regularFormatted}
      </p>
    ) : null;
  };

  return (
    <div
      ref={rootRef}
      className="grid grid-cols-[auto_1fr] items-center gap-3 relative"
    >
      <Button
        type="button"
        variant="ghost"
        className="size-10 hover:bg-muted"
        aria-label="Close search"
        onClick={onClose}
      >
        <HiOutlineXMark className="size-6" />
      </Button>

      <div className="relative w-full">
        <form onSubmit={submit} className="w-full">
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (q.trim()) setOpen(true);
            }}
            placeholder={placeholder}
            className="h-10 md:h-12"
          />
        </form>

        {open ? (
          <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-lg border bg-background shadow">
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">
                Searching…
              </div>
            ) : results.length ? (
              <ul className="max-h-80 overflow-auto text-primary">
                {results.map((p) => {
                  const href = getHref(p);
                  const img = getImg(p);
                  const label = getLabel(p);

                  return (
                    <li key={p.id}>
                      <Link
                        href={href}
                        className="w-full px-3 py-2 hover:bg-muted flex items-center gap-3"
                        onClick={() => onClose()}
                      >
                        {img ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted shrink-0">
                            <Image
                              src={img}
                              alt={getAlt(p)}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md border bg-muted shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {label}
                          </div>

                          {/* ✅ Price / pricing message */}
                          <PriceNode p={p} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-3 text-sm text-muted-foreground">
                No results
              </div>
            )}

            <div className="border-t p-2">
              <Button
                variant={"link"}
                type="button"
                className="w-full text-sm underline underline-offset-4"
                onClick={viewAll}
              >
                View all results
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
