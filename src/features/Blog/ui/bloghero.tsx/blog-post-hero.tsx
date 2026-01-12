import Image from "next/image";
import { BlogPost } from "../../actions/blog";
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

export function BlogPostHero({ post }: { post: BlogPost }) {
  return (
    <section>
      <div className="grid grid-cols-1 items-start gap-6 border-b p-6 md:grid-cols-2 md:items-center">
        {/* Left */}
        <div className="flex flex-col gap-6 lg:pl-12">
          <Breadcrumb
            items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
          />

          <div>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.publishedAt && (
              <p className="mt-3 text-sm text-muted-foreground">
                {fmtDate(post.publishedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        {post.coverImageUrl && (
          <div className="relative w-full overflow-hidden rounded-lg py-10 md:ml-auto md:w-[90%]">
            <div className="relative aspect-16/10 md:aspect-4/3 lg:aspect-video">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
