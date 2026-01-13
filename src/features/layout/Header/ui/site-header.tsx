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

  if (!nav?.enabled) {
    return null;
  }
  const logoUrl = config?.theme?.assets?.logoUrl;
  const storeName = config?.store?.name ?? "";

  // If there is literally nothing to show, render nothing (or a minimal header)
  const hasAnyNav = (nav.items?.length ?? 0) > 0;
  const hasAnyIcons = !!nav.icons && Object.values(nav.icons).some(Boolean);
  const shouldRenderHeader =
    hasAnyNav || hasAnyIcons || !!logoUrl || !!storeName;

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
              items={nav.items ?? []}
              extraLinks={nav.mobile?.extraLinks}
              logoUrl={logoUrl}
              storeName={storeName}
            />

            <Link href="/" className="hidden md:flex items-center">
              {logoUrl ? (
                <div className="relative h-16 w-26">
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
                <div className="relative h-16 w-22">
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
              {(nav.items?.length ?? 0) > 0 ? (
                nav.variant === "V2" ? (
                  <DesktopTwo items={nav.items} />
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
