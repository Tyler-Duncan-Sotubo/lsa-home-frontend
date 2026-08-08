"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/types/header-types";
import { cn } from "@/lib/utils";

function normalizePath(p: string) {
  if (!p) return "/";
  const clean = p.split("?")[0].split("#")[0];
  return clean !== "/" ? clean.replace(/\/+$/, "") : "/";
}

function isActivePath(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/") return current === "/";
  return current === target || current.startsWith(target + "/");
}

// nav.variant "V3" — andrea only. The active item is a solid black pill
// (pillClean shape) that swaps to the primary color on hover — same
// shape, just a color change. Every other item is plain text that only
// changes color (black -> primary) on hover, no background/pill at all.
// Flat nav only (no mega menus) — Emilia's config has none, and andrea
// doesn't need that complexity.
export function DesktopThree({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-center gap-2">
      {items.map((item) => {
        if (item.type === "mega") return null; // not supported in andrea
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-5 py-2 text-base font-semibold transition-colors",
              active
                ? "rounded-tl-[15px] rounded-br-[15px] rounded-tr-none rounded-bl-none bg-black text-white hover:bg-primary"
                : "text-foreground hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
