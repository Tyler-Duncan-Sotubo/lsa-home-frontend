"use client";
import Link from "next/link";
import Image from "next/image";
import { format as fmtDate } from "date-fns";

import { RevealFromSide } from "@/shared/animations/reveal-from-side";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";

export type BlogPostLite = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
};

export function BlogListOne({
  posts,
  basePath = "/blog",
  className,
  gridLimit = 8,
}: {
  posts: BlogPostLite[];
  basePath?: string;
  className?: string;
  gridLimit?: number;
}) {
  if (!posts?.length) return null;

  const featured = posts[0];
  const side = posts.slice(1, 3);
  const rest = posts.slice(3, 3 + gridLimit);

  return (
    <div className={className ?? "w-[99%] mx-auto"}>
      {/* Top editorial row */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Featured */}
        <SectionReveal className="lg:col-span-2" y={14}>
          <RevealFromSide direction="left" distance={22}>
            <article className="overflow-hidden">
              <Link href={`${basePath}/${featured.slug}`} className="block">
                <div className="relative aspect-video w-full">
                  {featured.coverImageUrl ? (
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>

                <div className="py-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    {featured.publishedAt
                      ? fmtDate(featured.publishedAt, "MMMM dd, yyyy")
                      : ""}
                  </div>

                  <h2 className="mt-2 text-2xl md:text-3xl font-heading font-semibold tracking-tight line-clamp-2">
                    {featured.title}
                  </h2>

                  {featured.excerpt ? (
                    <p className="mt-3 text-muted-foreground line-clamp-3">
                      {featured.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-5 inline-flex items-center text-sm font-semibold underline underline-offset-4">
                    Read article
                  </div>
                </div>
              </Link>
            </article>
          </RevealFromSide>
        </SectionReveal>

        {/* Right column: next 2 stacked */}
        <Stagger
          className="grid gap-6"
          delayChildren={0.06}
          staggerChildren={0.1}
        >
          {side.map((p) => (
            <StaggerItem key={p.id} y={10}>
              <RevealFromSide direction="right" distance={18}>
                <article className="overflow-hidden">
                  <Link href={`${basePath}/${p.slug}`} className="block">
                    <div className="relative aspect-16/10 w-full">
                      {p.coverImageUrl ? (
                        <Image
                          src={p.coverImageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, 100vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>

                    <div className="py-4">
                      <div className="text-xs font-medium text-muted-foreground">
                        {p.publishedAt
                          ? fmtDate(p.publishedAt, "MMMM dd, yyyy")
                          : ""}
                      </div>
                      <h3 className="mt-2 text-lg font-heading font-semibold line-clamp-2">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {p.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              </RevealFromSide>
            </StaggerItem>
          ))}

          {side.length === 0 ? (
            <StaggerItem y={10}>
              <SectionReveal y={10}>
                <div className="rounded-xl border bg-background p-5 text-sm text-muted-foreground">
                  More posts coming soon.
                </div>
              </SectionReveal>
            </StaggerItem>
          ) : null}
        </Stagger>
      </section>

      {/* Optional grid for the rest */}
      {rest.length ? (
        <SectionReveal className="mt-10 border-t pt-10" y={14} delay={0.05}>
          <Stagger
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            delayChildren={0.06}
            staggerChildren={0.08}
          >
            {rest.map((p) => (
              <StaggerItem key={p.id} y={10}>
                <article className="overflow-hidden">
                  <Link href={`${basePath}/${p.slug}`} className="block">
                    <div className="relative aspect-16/10 w-full">
                      {p.coverImageUrl ? (
                        <Image
                          src={p.coverImageUrl}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>

                    <div className="py-4">
                      <div className="text-xs font-medium text-muted-foreground">
                        {p.publishedAt
                          ? fmtDate(p.publishedAt, "MMMM dd, yyyy")
                          : ""}
                      </div>
                      <h3 className="mt-2 text-lg font-heading font-semibold line-clamp-2">
                        {p.title}
                      </h3>
                      {p.excerpt ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                          {p.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </SectionReveal>
      ) : null}
    </div>
  );
}
