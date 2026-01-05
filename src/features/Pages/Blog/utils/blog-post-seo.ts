// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildBlogPostMetadata(post: any) {
  const seo = post.seoFields ?? null;

  const rawExcerpt =
    seo?.excerpt ??
    post.excerpt?.replace(/<[^>]*>/g, "") ??
    `Read more about ${post.title}`;

  const description = String(rawExcerpt).slice(0, 155);

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
      type: "article" as const,
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
      card: "summary_large_image" as const,
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
