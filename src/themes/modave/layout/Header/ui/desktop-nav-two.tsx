"use client";

import Link from "next/link";
import type { NavItem } from "@/config/types/header-types";

type Props = {
  items: NavItem[];
};

export function DesktopTwo({ items }: Props) {
  return (
    <nav className="hidden md:flex flex-1 justify-center">
      <ul className="flex items-center gap-6">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`}>
            <Link
              href={item.href}
              className="2xl:text-base text-sm font-medium hover:underline hover:font-semibold transition-all"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
