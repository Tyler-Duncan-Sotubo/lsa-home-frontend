/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/types/header-types";

/** Match helpers */
function normalizePath(p: string) {
  if (!p) return "/";
  const clean = p.split("?")[0].split("#")[0];
  return clean !== "/" ? clean.replace(/\/+$/, "") : "/";
}

function isActivePath(pathname: string, href: string, exact?: boolean) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  if (exact) return current === target;
  if (target === "/") return current === "/";

  return current === target || current.startsWith(target + "/");
}

type Props = {
  items: NavItem[];
  specialItems?: Array<{
    matchLabel: string;
    className: string;
  }>;
};

export function DesktopOne({ items, specialItems }: Props) {
  const pathname = usePathname();

  const [openLabel, setOpenLabel] = React.useState<string | null>(null);

  const openItem = React.useMemo(
    () => items.find((i) => i.label === openLabel && i.type === "mega"),
    [items, openLabel]
  ) as Extract<NavItem, { type: "mega" }> | undefined;

  const getSpecialClass = (label: string) =>
    specialItems?.find((s) => s.matchLabel === label)?.className ?? "";

  // Close on ESC
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenLabel(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close on route change (pathname changes)
  React.useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  // Mark mega trigger active if any of its links are active
  function isMegaActive(item: Extract<NavItem, { type: "mega" }>) {
    const hrefs: string[] = [
      ...(item.sections?.flatMap((s) => s.items.map((x) => x.href)) ?? []),
      ...(item.feature?.href ? [item.feature.href] : []),
    ];
    return hrefs.some((href) => isActivePath(pathname, href));
  }

  return (
    <div className="hidden md:block">
      {/* Top nav row */}
      <div className="flex items-center justify-center gap-2">
        {items.map((item) => {
          const active =
            item.type === "mega"
              ? isMegaActive(item as Extract<NavItem, { type: "mega" }>)
              : isActivePath(pathname, (item as any).href);

          if (item.type === "mega") {
            const mega = item as Extract<NavItem, { type: "mega" }>;
            const isOpen = openLabel === mega.label;

            return (
              <div
                key={mega.label}
                className="relative flex items-center"
                onMouseEnter={() => setOpenLabel(mega.label)}
                onMouseLeave={() => setOpenLabel(null)}
              >
                {/* ✅ Clickable label */}
                <Link
                  href={mega.href ?? "#"}
                  onFocus={() => setOpenLabel(mega.label)}
                  className={[
                    "px-3 py-1 cursor-pointer 2xl:text-base text-sm font-medium transition-all",
                    "hover:underline hover:font-semibold",
                    active ? "underline font-semibold" : "",
                    getSpecialClass(mega.label),
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {mega.label}
                </Link>

                {/* ✅ Separate toggle (so you can still open menu without navigating) */}
                <button
                  type="button"
                  onClick={() => setOpenLabel(isOpen ? null : mega.label)}
                  aria-expanded={isOpen}
                  aria-controls={`mega-${mega.label}`}
                  className="p-1 rounded-md hover:bg-muted"
                  title="Open menu"
                >
                  <span className="sr-only">Open {mega.label} menu</span>
                  {/* tiny chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          }

          // simple link
          return (
            <Link
              key={item.label}
              href={(item as any).href}
              className={[
                "px-3 py-1 2xl:text-base text-sm font-medium transition-all",
                "hover:underline hover:font-semibold",
                active ? "font-semibold underline" : "",
                getSpecialClass(item.label),
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Full-screen dropdown overlay */}
      {openItem ? (
        <MegaOverlay
          id={`mega-${openItem.label}`}
          item={openItem}
          pathname={pathname}
          onClose={() => setOpenLabel(null)}
        />
      ) : null}
    </div>
  );
}

/* ------------------ */
/* Full-screen overlay */
/* ------------------ */

function MegaOverlay({
  id,
  item,
  pathname,
  onClose,
}: {
  id: string;
  item: Extract<NavItem, { type: "mega" }>;
  pathname: string;
  onClose: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // ✅ Close when clicking outside the panel (without blocking page clicks)
  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const panel = panelRef.current;
      if (!panel) return;

      // If click is inside the panel, do nothing
      if (panel.contains(e.target as Node)) return;

      // Otherwise close
      onClose();
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-9999 pointer-events-none"
      role="dialog"
      aria-label={`${item.label} menu`}
      aria-modal={false as any}
    >
      {/* Optional visual backdrop (non-interactive so page remains clickable) */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Panel: full width, anchored under header */}
      <div
        ref={panelRef}
        className="absolute left-0 right-0 top-0 md:top-20 pointer-events-auto"
        onMouseLeave={onClose} // ✅ close when leaving dropdown area
      >
        {/* adjust md:top-20 to match your header height */}
        <div id={id} className="bg-background border-t shadow-lg">
          <div className="mx-auto w-[95%] py-8">
            {/* ✅ sections + divider + feature */}
            <div className="grid gap-8 lg:grid-cols-[2fr_1px_1fr] items-stretch">
              {/* Left: sections */}
              <div className="grid gap-8 md:grid-cols-3">
                {(item.sections ?? []).map((sec) => (
                  <div key={sec.title} className="space-y-3">
                    <div className="text-base font-bold text-primary">
                      {sec.title}
                    </div>
                    <ul className="space-y-2">
                      {sec.items.map((link) => {
                        const active = isActivePath(pathname, link.href, true);
                        return (
                          <li key={link.label} className="">
                            <Link
                              href={link.href}
                              onClick={onClose}
                              aria-current={active ? "page" : undefined}
                              className={[
                                "block rounded-md py-1 transition-all",
                                "",
                                active ? "font-bold" : "",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium hover:underline hover:font-semibold">
                                  {link.label}
                                </span>
                                {link.badge ? (
                                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">
                                    {link.badge}
                                  </span>
                                ) : null}
                              </div>

                              {link.description ? (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {link.description}
                                </p>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* ✅ Divider */}
              <div className="hidden lg:block bg-border" />

              {/* Right: Featured tile */}
              {item.feature ? (
                <Link
                  href={item.feature.href}
                  onClick={onClose}
                  className={["group overflow-hidden", "transition-all"].join(
                    " "
                  )}
                >
                  <div className="relative h-96 w-full aspect-12/16">
                    <Image
                      src={item.feature.image.src}
                      alt={item.feature.image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="py-4">
                    <div className="text-xl font-bold group-hover:underline">
                      {item.feature.label}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-lg border bg-card p-4">
                  <div className="text-sm font-semibold">Featured</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add a featured block to highlight a collection or promotion.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
