// components/blog/FeaturedPost.tsx
import Link from "next/link";
import type { Post } from "@/lib/graphql/type";
import { format } from "date-fns";

type FeaturedPostProps = {
  post: Post;
};

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const image = post.featuredImage?.node?.sourceUrl;
  const alt = post.featuredImage?.node?.altText || post.title;
  const date = format(new Date(post.date), "MMMM d, yyyy");

  return (
    <article className="w-full">
      {/* Full-width image */}
      {image && (
        <Link
          href={`/blog/${post.slug}`}
          className="block w-full overflow-hidden"
        >
          <div className="relative h-72 w-full sm:h-114 lg:h-120">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={alt}
              className="h-full w-full object-cover object-middle transition-transform duration-300 hover:scale-105"
            />
          </div>
        </Link>
      )}

      {/* Content below */}
      <div className="mt-6 space-y-4 text-center">
        {/* Meta: date + author */}
        <div className="flex flex-wrap justify-center gap-1 text-lg uppercase tracking-wide text-primary-foreground font-bold">
          <span>{date}</span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-3xl font-semibold leading-snug hover:underline text-primary-foreground">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <div
            className="text-base text-muted-foreground leading-relaxed truncate-md mx-auto max-w-3xl "
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        )}

        {/* Tags */}
        {post.tags?.nodes?.length ? (
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            {post.tags.nodes.map((tag) => (
              <span
                key={tag.slug}
                className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
