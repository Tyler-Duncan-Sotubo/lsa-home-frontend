"use client";

import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { DesktopNav } from "./desktop-nav";
import { HeaderIcons } from "./header-icons";
import { mainNav } from "../config/header-data";

export function SiteHeader() {
  return (
    <div className="mx-auto flex h-16 w-[95%] items-center justify-between gap-4 md:h-20">
      {/* Left: mobile nav + logo */}
      <div className="flex items-center gap-3">
        <MobileNav items={mainNav} />

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://lsahome.co/cdn/shop/files/LSA-final-logo_light_green_transparent.png"
            alt="Brand"
            width={200}
            height={50}
            className="h-12 w-auto"
          />
        </Link>
      </div>

      {/* Center: desktop nav */}
      <DesktopNav items={mainNav} />

      {/* Right: icons */}
      <HeaderIcons />
    </div>
  );
}
