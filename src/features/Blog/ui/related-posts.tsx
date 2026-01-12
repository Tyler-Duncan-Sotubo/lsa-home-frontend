import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "../actions/blog";

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts?.length) return null;

  return (
    <section className="mx-auto w-[95%] max-w-6xl py-10">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Related posts</h2>
        <p className="text-sm text-muted-foreground">
          More articles you might like.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group overflow-hidden transition"
          >
            <div className="relative aspect-16/10 bg-muted">
              {p.coverImageUrl ? (
                <Image
                  src={p.coverImageUrl}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              ) : null}
            </div>

            <div className="py-4">
              <p className="line-clamp-2 text-sm font-semibold">{p.title}</p>
              {p.excerpt ? (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {p.excerpt.replace(/<[^>]*>/g, "")}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
