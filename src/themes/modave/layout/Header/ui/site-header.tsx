"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { MobileNav } from "./mobile-nav";
import { DesktopOne } from "./desktop-nav-one";
import { DesktopTwo } from "./desktop-nav-two";
import { HeaderIcons } from "./header-icons";
import { HeaderSearch } from "./header-search";

type Props = { config: StorefrontConfigV1 };

export function SiteHeader({ config }: Props) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  const nav = config?.header?.nav;
  const ui = config?.ui?.headerMenu; // { blog?: boolean; about?: boolean; contact?: boolean }
  const logoUrl = config?.theme?.assets?.logoUrl;
  const storeName = config?.store?.name ?? "";

  // Filter nav items based on headerMenu toggles.
  // Home + Shop are always shown. About/Contact/Blog are controlled by ui.headerMenu flags.
  const filteredNavItems = React.useMemo(() => {
    const items = nav.items ?? [];
    return items.filter((item) => emphasizesAlwaysShowOrAllowed(item, ui));
  }, [nav.items, ui]);

  const hasAnyNav = filteredNavItems.length > 0;
  const hasAnyIcons = !!nav.icons && Object.values(nav.icons).some(Boolean);
  const shouldRenderHeader =
    hasAnyNav || hasAnyIcons || !!logoUrl || !!storeName;

  if (!nav?.enabled) return null;
  if (!shouldRenderHeader) return null;

  return (
    <header className="mx-auto w-[95%]">
      {searchOpen ? (
        <div className="h-16 md:h-20 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <HeaderSearch
              onClose={() => setSearchOpen(false)}
              placeholder="Search products..."
            />
          </div>
        </div>
      ) : (
        <div className="grid h-16 md:h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <MobileNav
              items={filteredNavItems}
              extraLinks={nav.mobile?.extraLinks}
              logoUrl={logoUrl}
              storeName={storeName}
            />

            <Link href="/" className="hidden md:flex items-center">
              {logoUrl ? (
                <div className="relative h-10 w-20">
                  <Image
                    src={logoUrl}
                    alt={storeName}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">{storeName}</span>
              )}
            </Link>
          </div>

          {/* CENTER */}
          <div className="flex justify-center">
            <Link href="/" className="flex md:hidden items-center">
              {logoUrl ? (
                <div className="relative h-10 w-20">
                  <Image
                    src={logoUrl}
                    alt={storeName}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">{storeName}</span>
              )}
            </Link>

            <div className="hidden md:flex">
              {filteredNavItems.length > 0 ? (
                nav.variant === "V2" ? (
                  <DesktopTwo items={filteredNavItems} />
                ) : (
                  <DesktopOne
                    items={nav.items}
                    specialItems={nav.specialItems}
                  />
                )
              ) : null}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-end">
            <HeaderIcons
              icons={nav.icons}
              onSearchClick={() => setSearchOpen(true)}
            />
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Home + Shop are always shown.
 * About/Contact/Blog are gated by config.ui.headerMenu flags.
 *
 * This is intentionally tolerant:
 * - supports various hrefs for "about" (e.g. /about, /about-us)
 * - supports various hrefs for "contact" (e.g. /contact, /contact-us)
 * - supports blog under /blog (and any nested routes)
 */
function emphasizesAlwaysShowOrAllowed(
  item: { label: string; href: string },
  ui?: { blog?: boolean; about?: boolean; contact?: boolean },
) {
  const label = (item.label ?? "").trim().toLowerCase();
  const href = (item.href ?? "").trim().toLowerCase();

  // Always show these (by label OR by path)
  const isHome = label === "home" || href === "/";
  const isShop =
    label === "shop" ||
    href === "/shop" ||
    href.startsWith("/shop/") ||
    href.startsWith("/products") ||
    href.startsWith("/collections");

  if (isHome || isShop) return true;

  // If ui.headerMenu is missing, keep current behavior (show everything)
  if (!ui) return true;

  const isBlog =
    label === "blog" || href === "/blog" || href.startsWith("/blog/");
  const isContact =
    label === "contact" ||
    href === "/contact" ||
    href.startsWith("/contact") ||
    href.includes("/contact-");
  const isAbout =
    label === "about" ||
    label === "about us" ||
    href === "/about" ||
    href === "/about-us" ||
    href.startsWith("/about");

  if (isBlog) return ui.blog !== false; // default: show unless explicitly false
  if (isContact) return ui.contact !== false;
  if (isAbout) return ui.about !== false;

  // Anything else: leave it alone (still shown)
  return true;
}
