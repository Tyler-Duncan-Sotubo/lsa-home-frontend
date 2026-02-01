/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MetadataRoute } from "next";
import { getSitemapBaseUrl } from "@/shared/seo/get-sitemap-base-url";
import { listStorefrontCategories } from "@/features/Collections/actions/get-collections";
import { listProducts } from "@/features/Products/actions/products";
import { listBlogPostsPublic } from "@/features/Blog/actions/blog";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";

const PRODUCTS_PAGE_SIZE = 200;
const BLOG_PAGE_SIZE = 100;

const MAX_PRODUCT_PAGES = 200;
const MAX_BLOG_PAGES = 200;

function normalizePath(href: string): string | null {
  if (!href) return null;

  const raw = href.trim();

  // Ignore anchors and javascript links
  if (raw.startsWith("#") || raw.toLowerCase().startsWith("javascript:"))
    return null;

  // External URLs: ignore (or include if you really want, but usually not)
  if (/^https?:\/\//i.test(raw)) return null;

  // Must be a path
  if (!raw.startsWith("/")) return null;

  // Drop query/hash for canonical sitemap URLs
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? raw;

  // Normalize trailing slash (keep root as "/")
  if (pathOnly.length > 1 && pathOnly.endsWith("/")) {
    return pathOnly.slice(0, -1);
  }

  return pathOnly;
}

function navPagesToEntries(
  baseUrl: string,
  now: Date,
  navItems: Array<{ href: string; label?: string }> | undefined,
): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const item of navItems ?? []) {
    const path = normalizePath(item.href);
    if (!path) continue;

    // Don’t add routes you already have as static entries (avoid dupes)
    // Also skip obvious non-page routes if needed
    if (
      path === "/" ||
      path === "/blog" ||
      path === "/collections" ||
      path === "/products"
    ) {
      continue;
    }

    if (seen.has(path)) continue;
    seen.add(path);

    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}

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

  for (let page = 2; page <= totalPages; page++) {
    const data = await listBlogPostsPublic({ page, limit: BLOG_PAGE_SIZE });
    if (!data.items?.length) break;
    add(data.items);
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getSitemapBaseUrl();
  const now = new Date();

  const [config, collections, productEntries, blogEntries] = await Promise.all([
    getStorefrontConfig(),
    listStorefrontCategories({ limit: 5000 }),
    getAllProductEntries(baseUrl, now),
    getAllBlogEntries(baseUrl, now),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/products`, lastModified: now, priority: 0.7 },
  ];

  const collectionEntries: MetadataRoute.Sitemap = (collections ?? [])
    .filter((c) => !!c?.slug)
    .map((c) => ({
      url: `${baseUrl}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
    }));

  // ✅ Pages from config.nav.items
  const navItems = config?.header?.nav?.items ?? [];
  const navPageEntries = navPagesToEntries(baseUrl, now, navItems);

  return [
    ...staticEntries,
    ...navPageEntries,
    ...collectionEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
