import type { Metadata } from "next";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { listBlogPostsPublic } from "@/features/Blog/actions/blog";
import { BlogListRenderer } from "@/features/Blog/ui/bloglist/blog-list-renderer";
import Pagination from "@/shared/ui/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.blog?.seo ?? {
      title: "Blog",
      description: "Read the latest articles, insights, and guides.",
    },
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const config = await getStorefrontConfig();
  const resolvedSearchParams = await searchParams;

  const currentPage = Math.max(
    1,
    Number(resolvedSearchParams?.page ?? "1") || 1
  );
  const limit = 6;

  // ✅ paginated response (after backend change)
  const { items, totalPages } = await listBlogPostsPublic({
    page: currentPage,
    limit,
  });

  // Your config uses pages.blog.version ("V1" | "V2")
  const variant = (config.pages?.blog?.listVariant ?? "V1") as "V1" | "V2";

  const title = config.pages?.blog?.seo?.title ?? "Blog";
  const description =
    config.pages?.blog?.seo?.description ??
    "Read the latest articles, insights, and guides.";

  return (
    <main className="mx-auto w-[95%] py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </header>

      <BlogListRenderer variant={variant} posts={items} />

      {totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/blog"
        />
      ) : null}
    </main>
  );
}
