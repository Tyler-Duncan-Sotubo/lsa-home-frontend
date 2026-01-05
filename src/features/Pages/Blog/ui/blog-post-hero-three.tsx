import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { BlogPost } from "../actions/blog";

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

export function BlogPostHeroThree({ post }: { post: BlogPost }) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
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

        {post.excerpt ? (
          <p className="mt-6 text-base text-muted-foreground max-w-2xl mx-auto">
            {post.excerpt.replace(/<[^>]*>/g, "")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
