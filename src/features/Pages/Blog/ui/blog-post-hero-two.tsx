import Image from "next/image";

import { BlogPost } from "../actions/blog";
import { Breadcrumb } from "@/shared/seo/breadcrumb";

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function BlogPostHeroTwo({ post }: { post: BlogPost }) {
  return (
    <section>
      {/* Full-width image */}
      {post.coverImageUrl ? (
        <div className="relative w-full overflow-hidden">
          <div className="relative aspect-video md:aspect-21/9">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      ) : null}

      {/* Title block */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Breadcrumb
          items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
        />

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          {post.title}
        </h1>

        {post.publishedAt ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {fmtDate(post.publishedAt)}
          </p>
        ) : null}
      </div>
    </section>
  );
}
