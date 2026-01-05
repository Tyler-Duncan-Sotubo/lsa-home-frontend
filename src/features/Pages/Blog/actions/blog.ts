import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type BlogPostStatus = "DRAFT" | "PUBLISHED";

export type BlogPost = {
  id: string;
  storeId: string;

  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  content?: string | null;

  status: BlogPostStatus;
  publishedAt?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  createdAt?: string;
  updatedAt?: string;

  // if your public endpoint returns relations
  products?: Array<{
    postId: string;
    productId: string;
    sortOrder?: number;
    product?: unknown;
  }>;
};

export type PaginatedBlogPosts = {
  items: BlogPost[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listBlogPostsPublic({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const res = await storefrontFetchSafe<PaginatedBlogPosts>(
    `/api/blog-posts/public/list?page=${page}&limit=${limit}`,
    { revalidate: 60, tags: ["blog", "blog:list", `blog:page:${page}`] }
  );

  if (!res.ok) {
    console.error("listBlogPostsPublic failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return {
      items: [],
      page,
      limit,
      total: 0,
      totalPages: 0,
    };
  }

  return res.data;
}

export async function getBlogPostBySlugPublic(slug: string) {
  const res = await storefrontFetchSafe<BlogPost>(
    `/api/blog-posts/public/${encodeURIComponent(slug)}`,
    { revalidate: 60, tags: ["blog", `blog:${slug}`] }
  );

  if (!res.ok) {
    console.error("getBlogPostBySlugPublic failed", {
      statusCode: res.statusCode,
      error: res.error,
      slug,
    });
    return null; // caller decides 404 etc
  }

  return res.data;
}
