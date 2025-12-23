/* eslint-disable @typescript-eslint/no-explicit-any */
import Breadcrumb from "@/features/blog/Breadcrumb";
import Image from "next/image";
import { format } from "date-fns";
import FloatingShare from "@/features/blog/FloatingShare";
import type { Metadata } from "next";
import { POST_BY_SLUG } from "@/lib/graphql/queries";
import { wpFetch } from "@/lib/graphql/client";

export const revalidate = 3600; // 1 hour

// ✅ SEO metadata (runs on server)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // 👇 important: await params
  const { slug } = await params;

  const data = await wpFetch<{ post: any }>({
    query: POST_BY_SLUG,
    variables: { slug },
    revalidate,
  });

  const post = data.post;
  if (!post) {
    return {
      title: "Post not found | Centa Blog",
      description: "The requested post could not be found.",
    };
  }

  const seo = post.seoFields ?? null;

  const rawExcerpt =
    seo?.excerpt ??
    post.excerpt?.replace(/<[^>]*>/g, "") ??
    "Read more about " + post.title;

  const description = (rawExcerpt as string).slice(0, 155);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
  const image = post.featuredImage?.node?.sourceUrl;

  const title = seo?.metaTitle || `${post.title} | Centa Blog`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Centa Blog",
      type: "article",
      publishedTime: post.date,
      authors: [post.author?.node?.name ?? "Centa HR"],
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: post.featuredImage?.node?.altText || post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

// ✅ Actual page component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 👇 important: await params
  const { slug } = await params;

  const data = await wpFetch<{ post: any }>({
    query: POST_BY_SLUG,
    variables: { slug },
    revalidate,
  });

  const post = data.post;
  if (!post) {
    return <div className="mx-auto max-w-3xl p-6">Post not found.</div>;
  }

  const tag = post.tags?.nodes?.[0];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
  const firstTags = post.tags?.nodes?.map((t: any) => t.name) ?? [];

  return (
    <article className="pt-2">
      <FloatingShare
        title={post.title}
        url={canonicalUrl}
        summary={post.excerpt ? post.title : undefined}
        tags={firstTags}
        offsetTop={160}
      />

      {/* HERO */}
      <section>
        <div className="grid grid-cols-1 items-start gap-6 border-b p-6 md:grid-cols-2 md:items-center">
          {/* Left */}
          <div className="flex flex-col gap-6 lg:pl-12">
            <Breadcrumb
              items={[
                { name: "Blog", href: "/blog" },
                ...(tag
                  ? [{ name: tag.name, href: `/topic/${tag.slug}` }]
                  : []),
                { name: post.title },
              ]}
            />

            <div>
              <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {format(new Date(post.date), "MMMM d, yyyy")} —{" "}
                {post.author?.node?.name}
              </p>
            </div>
          </div>

          {/* Right: hero image */}
          {post.featuredImage?.node?.sourceUrl && (
            <div className="relative w-full overflow-hidden rounded-lg py-10 md:ml-auto md:w-[90%]">
              <div className="relative aspect-16/10 md:aspect-4/3 lg:aspect-video">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
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

      {/* BODY */}
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div
          className="prose prose-neutral max-w-none text-[1.05rem] leading-7 dark:prose-invert sm:text-[1.4rem]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>
    </article>
  );
}
