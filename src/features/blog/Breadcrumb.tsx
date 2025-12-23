"use client";

import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";

interface Crumb {
  name: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1 capitalize">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary-brand-button font-medium"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.name}</span>
              )}

              {!isLast && (
                <FaLongArrowAltRight className="h-3.5 w-3.5 opacity-60" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
