import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getBlogPostBySlugPublic as _getBlogPostBySlugPublic } from "@/features/Blog/actions/blog";
import { getStorefrontConfig as _getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { BlogPostRenderer } from "@/features/Blog/ui/blogpost/blog-post-renderer";
import { getRelatedBlogPosts } from "@/features/Blog/actions/related";
import { RelatedPosts } from "@/features/Blog/ui/related-posts";
import { buildMetadata } from "@/shared/seo/build-metadata";

// ✅ cache to avoid double hits from generateMetadata + page
const getStorefrontConfig = cache(async () => _getStorefrontConfig());
const getBlogPostBySlugPublic = cache(async (slug: string) =>
  _getBlogPostBySlugPublic(slug),
);

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [config, post] = await Promise.all([
    getStorefrontConfig(),
    getBlogPostBySlugPublic(slug),
  ]);

  const base = buildMetadata({
    globalSeo: config.seo,
    pageSeo: post
      ? {
          title: post.seoTitle || post.title,
          description:
            post.seoDescription ||
            (post.excerpt ? stripHtml(post.excerpt).slice(0, 155) : ""),
        }
      : {
          title: `Post not found | ${config.seo?.siteName || config.store?.name || "Storefront"}`,
          description: "The requested post could not be found.",
        },
  });

  // Add your canonical + OG/article bits here as needed
  return {
    ...base,
    alternates: { canonical: /* your canonicalUrl */ undefined },
    openGraph: {
      ...base.openGraph,
      type: post ? "article" : "website",
      publishedTime: post?.publishedAt ?? undefined,
      images: post?.coverImageUrl
        ? [
            {
              url: post.coverImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      card: "summary_large_image",
      images: post?.coverImageUrl ? [post.coverImageUrl] : base.twitter?.images,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [config, post, related] = await Promise.all([
    getStorefrontConfig(),
    getBlogPostBySlugPublic(slug),
    getRelatedBlogPosts({ slug, limit: 3 }),
  ]);

  if (!post) return notFound();

  const canonicalBaseUrl =
    config.seo?.canonicalBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || "";

  const canonicalUrl = canonicalBaseUrl
    ? `${canonicalBaseUrl}/blog/${post.slug}`
    : `/blog/${post.slug}`;

  return (
    <>
      <BlogPostRenderer
        post={post}
        canonicalUrl={canonicalUrl}
        config={config}
      />
      <RelatedPosts posts={related} />
    </>
  );
}
