import "server-only";
import { listBlogPostsPublic, type BlogPost } from "./blog";

export async function getRelatedBlogPosts({
  slug,
  limit = 3,
}: {
  slug: string;
  limit?: number;
}): Promise<BlogPost[]> {
  const pageSize = Math.max(limit + 6, 9);
  const data = await listBlogPostsPublic({ page: 1, limit: pageSize });
  return (data.items ?? []).filter((p) => p.slug !== slug).slice(0, limit);
}
