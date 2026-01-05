export type StorefrontBlogPost = {
  id: string;
  title: string;
  slug: string;
  storeId: string;

  excerpt?: string | null;
  coverImageUrl?: string | null;

  content?: string | null;

  status: "draft" | "published" | string;
  publishedAt?: string | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  createdAt?: string;
  updatedAt?: string;

  isFeatured?: boolean;
};
