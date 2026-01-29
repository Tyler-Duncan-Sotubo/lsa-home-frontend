"use client";

import Image from "next/image";
import Link from "next/link";
import { format as fmtDate } from "date-fns";
import { BlogPostLite } from "./blog-list-one";

export function BlogListTwo({
  posts,
  basePath = "/blog",
  className,
  compact = false,
}: {
  posts: BlogPostLite[];
  basePath?: string;
  className?: string;
  compact?: boolean;
}) {
  if (!posts?.length) return null;

  return (
    <div
      className={[
        "grid grid-cols-1 md:grid-cols-2 gap-6",
        className ?? "",
      ].join(" ")}
    >
      {posts.map((p, idx) => {
        const isFull = !compact && idx % 3 === 0; // 0,3,6...

        return (
          <article
            key={p.id}
            className={["overflow-hidden", isFull ? "md:col-span-2" : ""].join(
              " ",
            )}
          >
            <Link href={`${basePath}/${p.slug}`} className="block h-full">
              {/* Image */}
              <div
                className={[
                  "relative w-full bg-muted",
                  compact
                    ? "aspect-16/10"
                    : isFull
                      ? "aspect-21/9 md:aspect-24/9"
                      : "aspect-video",
                ].join(" ")}
              >
                {p.coverImageUrl ? (
                  <Image
                    src={p.coverImageUrl}
                    alt={p.title}
                    fill
                    priority={idx < 2} // ✅ above-the-fold
                    loading={idx < 2 ? "eager" : "lazy"}
                    className="object-cover"
                    sizes={
                      isFull
                        ? "(min-width: 768px) 100vw, 100vw"
                        : "(min-width: 768px) 50vw, 100vw"
                    }
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>

              {/* Content */}
              <div
                className={[
                  compact ? "py-4" : "py-5",
                  isFull ? "text-center" : "",
                ].join(" ")}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {p.publishedAt ? fmtDate(p.publishedAt, "MMMM dd, yyyy") : ""}
                </div>

                <h3
                  className={[
                    "mt-2 font-heading font-semibold leading-snug line-clamp-2",
                    compact
                      ? "text-base"
                      : isFull
                        ? "text-xl md:text-2xl"
                        : "text-lg",
                  ].join(" ")}
                >
                  {p.title}
                </h3>

                {p.excerpt ? (
                  <p
                    className={[
                      "mt-2 text-muted-foreground",
                      compact ? "text-xs line-clamp-2" : "text-xs line-clamp-3",
                    ].join(" ")}
                  >
                    {p.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
