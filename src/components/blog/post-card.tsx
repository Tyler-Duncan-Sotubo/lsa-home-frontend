// components/blog/PostCard.tsx
import Link from "next/link";
import type { Post } from "@/lib/graphql/type";
import { format } from "date-fns";

type PostCardProps = {
  post: Post;
};

export default function PostCard({ post }: PostCardProps) {
  const image = post.featuredImage?.node?.sourceUrl;
  const alt = post.featuredImage?.node?.altText || post.title;

  const date = format(new Date(post.date), "MMMM d, yyyy");

  return (
    <article className="flex h-full flex-col">
      {image && (
        <Link
          href={`/blog/${post.slug}`}
          className="block w-full overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={alt}
            className="h-[360px] w-full object-cover object-top transition-transform duration-300 hover:scale-105 sm:h-[400px]"
          />
        </Link>
      )}

      <div className="flex flex-1 flex-col pt-4">
        <p className="mb-1 text-xs text-primary-foreground">{date}</p>

        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold leading-snug hover:underline text-primary-foreground">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <div
            className="mt-2 line-clamp-3 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        )}
      </div>
    </article>
  );
}
