"use client";

import Link from "next/link";
import Image from "next/image";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { MobileNav } from "@/themes/modave/layout/Header/ui/mobile-nav";
import { HeaderIcons } from "./header-icons";
import { HeaderSearch } from "./header-search";
import { DesktopThree } from "./desktop-nav-three";

type Props = { config: StorefrontConfigV1 };

// andrea's layout: search inline on the left (always visible, no toggle),
// logo centered, icons right — then a second row with the nav centered
// underneath. Distinct from modave's single-row logo-left/nav-center
// layout with search behind a toggle.
export function SiteHeader({ config }: Props) {
  const nav = config?.header?.nav;
  const ui = config?.ui?.headerMenu;
  const logoUrl = config?.theme?.assets?.logoUrl;
  const storeName = config?.store?.name ?? "";

  const filteredNavItems = (nav?.items ?? []).filter((item) =>
    isAlwaysShownOrAllowed(item, ui),
  );

  if (!nav?.enabled) return null;

  return (
    <div className="mx-auto w-[95%]">
      {/* Main row */}
      <div className="grid h-16 md:h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* LEFT: search (desktop) + mobile nav trigger */}
        <div className="flex items-center gap-2">
          <MobileNav
            items={filteredNavItems}
            extraLinks={nav.mobile?.extraLinks}
            logoUrl={logoUrl}
            storeName={storeName}
          />
          <div className="hidden md:block w-full max-w-xs">
            <HeaderSearch placeholder="Search..." />
          </div>
        </div>

        {/* CENTER: logo */}
        <Link href="/" className="flex items-center justify-center">
          {logoUrl ? (
            <div className="relative h-10 w-28 md:h-12 md:w-32">
              <Image
                src={logoUrl}
                alt={storeName}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <span className="text-lg font-semibold">{storeName}</span>
          )}
        </Link>

        {/* RIGHT: icons */}
        <div className="flex justify-end">
          <HeaderIcons icons={nav.icons} />
        </div>
      </div>

      {/* Nav row — andrea only implements V3 (pill-button nav); any other
          configured variant still renders V3 since that's the only shape
          this theme has. */}
      {filteredNavItems.length > 0 && (
        <div className="hidden md:flex items-center justify-center py-2">
          <DesktopThree items={filteredNavItems} />
        </div>
      )}
    </div>
  );
}

function isAlwaysShownOrAllowed(
  item: { label: string; href: string },
  ui?: { blog?: boolean; about?: boolean; contact?: boolean },
) {
  const label = (item.label ?? "").trim().toLowerCase();
  const href = (item.href ?? "").trim().toLowerCase();

  const isHome = label === "home" || href === "/";
  const isShop =
    label === "shop" ||
    href === "/shop" ||
    href.startsWith("/shop/") ||
    href.startsWith("/products") ||
    href.startsWith("/collections");

  if (isHome || isShop) return true;
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

  if (isBlog) return ui.blog !== false;
  if (isContact) return ui.contact !== false;
  if (isAbout) return ui.about !== false;

  return true;
}
