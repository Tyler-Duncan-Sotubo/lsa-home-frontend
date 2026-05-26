/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/types/header-types";

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
  specialItems?: Array<{ matchLabel: string; className: string }>;
};

export function DesktopOne({ items, specialItems }: Props) {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = React.useState<string | null>(null);

  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const getSpecialClass = (label: string) =>
    specialItems?.find((s) => s.matchLabel === label)?.className ?? "";

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = React.useCallback(
    (label: string) => {
      clearCloseTimer();
      setOpenLabel(label);
    },
    [clearCloseTimer],
  );

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenLabel(null);
      closeTimerRef.current = null;
    }, 250); // Brooklinen-style delay — long enough to move mouse into panel
  }, [clearCloseTimer]);

  const closeAll = React.useCallback(() => {
    clearCloseTimer();
    setOpenLabel(null);
  }, [clearCloseTimer]);

  // ESC
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeAll]);

  // Route change
  React.useEffect(() => {
    closeAll();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unmount cleanup
  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function isMegaActive(item: Extract<NavItem, { type: "mega" }>) {
    const hrefs: string[] = [
      ...(item.sections?.flatMap((s) => s.items.map((x) => x.href)) ?? []),
      ...(item.feature?.href ? [item.feature.href] : []),
    ];
    return hrefs.some((href) => isActivePath(pathname, href));
  }

  return (
    <div className="hidden md:block">
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
                onMouseEnter={() => openMenu(mega.label)}
                onMouseLeave={() => scheduleClose()}
              >
                {/*
                  Label is a plain button — hover opens the panel.
                  No chevron. No navigation from the label itself.
                  "Shop all" lives inside the panel (Brooklinen pattern).
                */}
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`mega-${mega.label}`}
                  className={[
                    "px-3 py-1 2xl:text-lg text-base font-medium transition-all",
                    "hover:underline hover:font-semibold",
                    active || isOpen ? "underline font-semibold" : "",
                    getSpecialClass(mega.label),
                  ].join(" ")}
                >
                  {mega.label}
                </button>

                {isOpen && (
                  <MegaOverlay
                    id={`mega-${mega.label}`}
                    item={mega}
                    pathname={pathname}
                    onClose={closeAll}
                    onMouseEnter={() => openMenu(mega.label)}
                    onMouseLeave={() => scheduleClose()}
                  />
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={(item as any).href}
              className={[
                "px-3 py-1 2xl:text-lg text-base font-medium transition-all",
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
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  Mega overlay                                   */
/* ─────────────────────────────────────────────── */

function MegaOverlay({
  id,
  item,
  pathname,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  id: string;
  item: Extract<NavItem, { type: "mega" }>;
  pathname: string;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-9999 pointer-events-auto"
      role="dialog"
      aria-label={`${item.label} menu`}
      aria-modal={false as any}
    >
      {/* Backdrop — clicking outside closes */}
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      {/* Panel — sits flush under the header, no gap */}
      <div
        className="absolute left-0 right-0 top-18 pointer-events-auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div id={id} className="bg-background border-t shadow-lg">
          <div className="mx-auto w-[95%] py-8">
            <div className="grid gap-8 lg:grid-cols-[2fr_1px_1fr] items-stretch">
              {/* Left: sections + Shop all at top */}
              <div className="space-y-6">
                {/* Shop all — Brooklinen puts this first, prominent */}
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="inline-block text-sm font-bold tracking-wide uppercase hover:underline"
                  >
                    Shop all {item.label} →
                  </Link>
                ) : null}

                <div className="grid gap-8 md:grid-cols-3 space-y-3">
                  {(item.sections ?? []).map((sec) => (
                    <div key={sec.title} className="space-y-3">
                      {sec.href ? (
                        <Link
                          href={sec.href}
                          onClick={onClose}
                          className="text-base font-bold text-primary hover:underline"
                        >
                          {sec.title} →
                        </Link>
                      ) : (
                        <div className="text-base font-bold text-primary">
                          {sec.title}
                        </div>
                      )}
                      <ul className="space-y-2 mt-2">
                        {sec.items.map((link) => {
                          const active = isActivePath(
                            pathname,
                            link.href,
                            true,
                          );
                          return (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                onClick={onClose}
                                aria-current={active ? "page" : undefined}
                                className={[
                                  "block rounded-md py-1 transition-all",
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
              </div>

              {/* Divider */}
              <div className="hidden lg:block bg-border" />

              {/* Right: featured tile */}
              {item.feature ? (
                <Link
                  href={item.feature.href}
                  onClick={onClose}
                  className="group overflow-hidden transition-all"
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
