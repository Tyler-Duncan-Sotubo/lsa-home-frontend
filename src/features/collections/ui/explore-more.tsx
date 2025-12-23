"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories } from "@/shared/assets/data/category";

export default function ExploreMore() {
  // Stable initial state for SSR: first 2 categories
  const [visible, setVisible] = useState(() => categories.slice(0, 2));

  useEffect(() => {
    // Shuffle only on the client after hydration
    const copy = [...categories];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(copy.slice(0, 2));
  }, []);

  return (
    <section className="w-full py-2">
      <div className="w-[95%] mx-auto text-center">
        {/* Header */}
        <h2 className="text-4xl font-semibold mb-6">Explore More</h2>

        {/* 2 Random Cards (after mount) */}
        <div className="flex justify-center gap-6">
          {visible.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="
  group relative
  w-96 sm:w-96 md:w-[400px]     /* MUCH bigger */
  aspect-4/5                  /* Taller image */
overflow-hidden
  bg-muted  hover:shadow-md transition
"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

              {cat.badge && (
                <div className="absolute right-3 top-3 z-10 h-10 w-10">
                  <Image
                    src={cat.badge}
                    alt={`${cat.title} badge`}
                    fill
                    className="object-contain drop-shadow"
                  />
                </div>
              )}

              <div className="absolute inset-x-4 bottom-4 z-10">
                <p className="text-base font-semibold underline text-white drop-shadow-sm">
                  {cat.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
