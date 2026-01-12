import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getBlogPostBySlugPublic as _getBlogPostBySlugPublic } from "@/features/Blog/actions/blog";
import { getStorefrontConfig as _getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { BlogPostRenderer } from "@/features/Blog/ui/blogpost/blog-post-renderer";
import { getRelatedBlogPosts } from "@/features/Blog/actions/related";
import { RelatedPosts } from "@/features/Blog/ui/related-posts";

// ✅ cache to avoid double hits from generateMetadata + page
const getStorefrontConfig = cache(async () => _getStorefrontConfig());
const getBlogPostBySlugPublic = cache(async (slug: string) =>
  _getBlogPostBySlugPublic(slug)
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

  const siteName = config.seo?.siteName || config.store?.name || "Storefront";

  const canonicalBaseUrl =
    config.seo?.canonicalBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || "";

  const requestedUrl = canonicalBaseUrl
    ? `${canonicalBaseUrl}/blog/${encodeURIComponent(slug)}`
    : `/blog/${encodeURIComponent(slug)}`;

  if (!post) {
    return {
      title: `Post not found | ${siteName}`,
      description: "The requested post could not be found.",
      alternates: { canonical: requestedUrl },
      robots: { index: false, follow: false },
      openGraph: {
        title: `Post not found | ${siteName}`,
        description: "The requested post could not be found.",
        url: requestedUrl,
        siteName,
        type: "website",
      },
    };
  }

  const title = post.seoTitle || post.title;

  const description =
    post.seoDescription ||
    (post.excerpt ? stripHtml(post.excerpt).slice(0, 155) : "");

  const canonicalUrl = canonicalBaseUrl
    ? `${canonicalBaseUrl}/blog/${post.slug}`
    : `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImageUrl
        ? [
            {
              url: post.coverImageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
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
