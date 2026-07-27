"use client";

import Link from "next/link";
import type { NavItem } from "@/config/types/header-types";

type Props = {
  items: NavItem[];
};

export function DesktopTwo({ items }: Props) {
  return (
    // min-w-0 lets the nav shrink below its content width, so a long menu
    // scrolls here instead of squeezing the logo and header icons.
    <nav className="hidden md:flex flex-1 min-w-0 justify-center">
      {/* Without nowrap/shrink-0 a long menu compresses each item until
          multi-word labels break mid-name ("About / Us"). Scrolling
          horizontally keeps every label readable at any item count. */}
      <ul className="flex items-center gap-6 max-w-full overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`} className="shrink-0">
            <Link
              href={item.href}
              className="2xl:text-lg text-base font-medium hover:underline hover:font-semibold transition-all"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
