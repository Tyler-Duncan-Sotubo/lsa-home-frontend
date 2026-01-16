"use client";

import Image from "next/image";
import Link from "next/link";
import type { StorefrontCategory } from "@/features/Collections/actions/get-collections";

const FALLBACK_IMAGE = "https://placehold.co/600x600?text=Category";

export default function CollectionsGridClient({
  categories,
}: {
  categories: StorefrontCategory[];
}) {
  return (
    <section className="mx-auto w-[95%] py-20">
      <h1 className="mb-12 text-2xl md:text-3xl font-heading font-semibold">
        Collections
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((c) => {
          const isHub = !c.parentId && c.hasChildren;

          const href = isHub
            ? `/collections/hubs/${c.slug}`
            : `/collections/${c.slug}`;

          return (
            <Link
              key={c.id}
              href={href}
              className="group relative block overflow-hidden rounded-2xl bg-muted shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-5/6">
                <Image
                  src={c.imageUrl || FALLBACK_IMAGE}
                  alt={c.imageAltText ?? c.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-90" />

              {/* Hub badge */}
              {isHub && (
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur">
                  Hub
                </span>
              )}

              {/* Label */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="inline-block rounded-lg bg-black/60 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
                  {c.name}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
