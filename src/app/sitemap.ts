/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MetadataRoute } from "next";
import { getSitemapBaseUrl } from "@/shared/seo/get-sitemap-base-url";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";
import { listProducts } from "@/features/Products/actions/products";
import { listBlogPostsPublic } from "@/features/Blog/actions/blog";

const PRODUCTS_PAGE_SIZE = 200;
const BLOG_PAGE_SIZE = 100;

// Safety caps (avoid infinite loops if backend ignores offset/page)
const MAX_PRODUCT_PAGES = 200; // 200 * 200 = 40,000 products
const MAX_BLOG_PAGES = 200; // 200 * 100 = 20,000 posts

async function getAllProductEntries(baseUrl: string, now: Date) {
  const entries: MetadataRoute.Sitemap = [];

  for (let page = 0; page < MAX_PRODUCT_PAGES; page++) {
    const offset = page * PRODUCTS_PAGE_SIZE;
    const products = await listProducts({ limit: PRODUCTS_PAGE_SIZE, offset });

    const got = products?.length ?? 0;

    if (!got) break;

    for (const p of products) {
      if (!p?.slug) continue;
      entries.push({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
      });
    }

    // last page
    if (got < PRODUCTS_PAGE_SIZE) break;
  }

  return entries;
}

async function getAllBlogEntries(baseUrl: string, now: Date) {
  const entries: MetadataRoute.Sitemap = [];

  const first = await listBlogPostsPublic({ page: 1, limit: BLOG_PAGE_SIZE });

  const add = (items: any[]) => {
    for (const post of items ?? []) {
      if (!post?.slug) continue;
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
        changeFrequency: "monthly",
      });
    }
  };

  add(first.items);

  const totalPages = Math.min(first.totalPages ?? 1, MAX_BLOG_PAGES);

  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      const data = await listBlogPostsPublic({ page, limit: BLOG_PAGE_SIZE });
      console.log("blog batch", { page, got: data.items?.length ?? 0 });
      add(data.items);

      // extra safety if API starts returning empty unexpectedly
      if (!data.items?.length) break;
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getSitemapBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/products`, lastModified: now, priority: 0.7 },
  ];

  const collections = await listStorefrontCategories({ limit: 5000 });

  const collectionEntries: MetadataRoute.Sitemap = (collections ?? [])
    .filter((c) => !!c?.slug)
    .map((c) => ({
      url: `${baseUrl}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
    }));

  const [productEntries, blogEntries] = await Promise.all([
    getAllProductEntries(baseUrl, now),
    getAllBlogEntries(baseUrl, now),
  ]);

  return [
    ...staticEntries,
    ...collectionEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
