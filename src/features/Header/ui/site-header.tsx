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
  const nav = config.header.nav;
  const logoUrl = config.theme?.assets?.logoUrl;

  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <header className="mx-auto w-[95%]">
      {searchOpen ? (
        /* SEARCH MODE */
        <div className="h-16 md:h-20 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <HeaderSearch
              onClose={() => setSearchOpen(false)}
              placeholder="Search products..."
            />
          </div>
        </div>
      ) : (
        /* NORMAL MODE */
        <div className="grid h-16 md:h-20 grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <MobileNav
              items={nav.items}
              extraLinks={nav.mobile?.extraLinks}
              logoUrl={logoUrl}
              storeName={config.store.name}
            />

            {/* Desktop logo (left-aligned) */}
            <Link href="/" className="hidden md:flex items-center">
              {logoUrl ? (
                <div className="relative h-16 w-26">
                  <Image
                    src={logoUrl}
                    alt={config.store.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">
                  {config.store.name}
                </span>
              )}
            </Link>
          </div>

          {/* CENTER */}
          <div className="flex justify-center">
            {/* Mobile logo (centered) */}
            <Link href="/" className="flex md:hidden items-center">
              {logoUrl ? (
                <div className="relative h-16 w-22">
                  <Image
                    src={logoUrl}
                    alt={config.store.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">
                  {config.store.name}
                </span>
              )}
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex">
              {nav.variant === "V2" ? (
                <DesktopTwo items={nav.items} />
              ) : (
                <DesktopOne items={nav.items} specialItems={nav.specialItems} />
              )}
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
