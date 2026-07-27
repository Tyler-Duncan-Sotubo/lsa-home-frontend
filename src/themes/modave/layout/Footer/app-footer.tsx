"use client";

import { FooterConfigV1 } from "@/config/types/footer.types";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  LayoutGrid,
  Heart,
  ShoppingCart,
  CreditCard,
  SlidersHorizontal,
  PlusCircle,
  Zap,
} from "lucide-react";

type Props = {
  footer: FooterConfigV1;
  onOpenFilter?: () => void;
  onOpenCart?: () => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
};

function routeMatches(path: string, patterns?: string[]) {
  if (!patterns?.length) return true;
  return patterns.some((p) =>
    p.endsWith("*") ? path.startsWith(p.slice(0, -1)) : path === p
  );
}

export function AppFooter({
  footer,
  onOpenFilter,
  onOpenCart,
  onAddToCart,
  onBuyNow,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const app = footer.appFooter;
  if (!app?.enabled) return null;

  if (app.includeRoutes?.length && !routeMatches(pathname, app.includeRoutes))
    return null;
  if (app.excludeRoutes?.length && routeMatches(pathname, app.excludeRoutes))
    return null;

  const items = app.items ?? [];
  if (!items.length) return null;

  const go = (href?: string) => {
    if (!href) return;
    router.push(href);
  };

  const defaultHref = (type: string) => {
    switch (type) {
      case "shop":
        return "/shop";
      case "category":
        return "/category";
      case "wishlist":
        return "/wishlist";
      case "cart":
        return "/cart";
      case "checkout":
        return "/checkout";
      default:
        return "/";
    }
  };

  const handleItem = (item: (typeof items)[number]) => {
    if (item.type === "shop") {
      const href = item.href ?? defaultHref("shop");
      const isActive = pathname.startsWith(href);
      if (isActive && item.onActive === "openFilter") {
        onOpenFilter?.();
        return;
      }
      go(href);
      return;
    }

    if (item.type === "cart") {
      if (item.openDrawer) {
        onOpenCart?.();
        return;
      }
      go(item.href ?? defaultHref("cart"));
      return;
    }

    if (item.type === "category")
      return go(item.href ?? defaultHref("category"));
    if (item.type === "wishlist")
      return go(item.href ?? defaultHref("wishlist"));
    if (item.type === "checkout")
      return go(item.href ?? defaultHref("checkout"));

    if (item.type === "custom") {
      if (item.hideOnRoutes && routeMatches(pathname, item.hideOnRoutes))
        return;
      if (item.showOnRoutes && !routeMatches(pathname, item.showOnRoutes))
        return;

      switch (item.action) {
        case "openFilter":
          onOpenFilter?.();
          return;
        case "openCart":
          onOpenCart?.();
          return;
        case "addToCart":
          onAddToCart?.();
          return;
        case "buyNow":
          onBuyNow?.();
          return;
        case "checkout":
          go(item.href ?? defaultHref("checkout"));
          return;
        default:
          go(item.href);
          return;
      }
    }
  };

  const labelFor = (item: (typeof items)[number]) => {
    if (item.type === "custom") return item.label;
    if ("label" in item && item.label) return item.label;
    return item.type.charAt(0).toUpperCase() + item.type.slice(1);
  };

  const isActive = (item: (typeof items)[number]) => {
    const href =
      item.type === "custom"
        ? item.href
        : ("href" in item && item.href) || defaultHref(item.type);

    if (!href) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  // ✅ ICONS (mobile app style)
  const iconFor = (item: (typeof items)[number], active: boolean) => {
    const cls = `h-8 w-8 ${active ? "opacity-100" : "opacity-80"}`;

    if (item.type === "shop") return <Store className={cls} />;
    if (item.type === "category") return <LayoutGrid className={cls} />;
    if (item.type === "wishlist") return <Heart className={cls} />;
    if (item.type === "cart") return <ShoppingCart className={cls} />;
    if (item.type === "checkout") return <CreditCard className={cls} />;

    // custom: choose by action (fallback icon)
    if (item.type === "custom") {
      switch (item.action) {
        case "openFilter":
          return <SlidersHorizontal className={cls} />;
        case "addToCart":
          return <PlusCircle className={cls} />;
        case "buyNow":
          return <Zap className={cls} />;
        case "openCart":
          return <ShoppingCart className={cls} />;
        case "checkout":
          return <CreditCard className={cls} />;
        default:
          return <LayoutGrid className={cls} />;
      }
    }

    return <LayoutGrid className={cls} />;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-9999 border-t bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {items.map((item, idx) => {
          if (item.type === "custom") {
            if (item.hideOnRoutes && routeMatches(pathname, item.hideOnRoutes))
              return null;
            if (item.showOnRoutes && !routeMatches(pathname, item.showOnRoutes))
              return null;
          }

          const active = isActive(item);

          return (
            <button
              key={`${item.type}-${idx}`}
              onClick={() => handleItem(item)}
              type="button"
              className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] transition ${
                active ? "font-semibold" : "opacity-85"
              }`}
            >
              {iconFor(item, active)}
              <span className="text-[11px] leading-none">{labelFor(item)}</span>

              {/* tiny active indicator dot (optional, feels like mobile apps) */}
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  active ? "bg-black" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* spacer so page content isn't hidden behind fixed footer */}
      <div className="h-14" />
    </div>
  );
}
