// app/blog/page.tsx
import type { Metadata } from "next";
import { wpFetch } from "@/lib/graphql/client";
import { LATEST_POSTS } from "@/lib/graphql/queries";
import { LatestPostsData, Post } from "@/lib/graphql/type";
import FeaturedPost from "../../features/blog/featured-post";
import PostGrid from "../../features/blog/post-grid";

export const revalidate = 60; // ISR: revalidate every 60s

// ✅ Blog home metadata
export async function generateMetadata(): Promise<Metadata> {
  const title = "Blog | LSA Home";
  const description =
    "Read the latest articles, insights, and guides from LSA Home on bedding, towels, home comfort, and lifestyle.";

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// 🔹 Fetch latest posts (Next.js cache only)
async function getLatestPosts(): Promise<LatestPostsData> {
  return wpFetch<LatestPostsData>({
    query: LATEST_POSTS,
    revalidate: 60, // aligns with route ISR
    tags: ["posts", "blog-home"],
  });
}

export default async function BlogHome() {
  const data = await getLatestPosts();
  const posts: Post[] = data.posts?.nodes ?? [];

  if (!posts.length) {
    return (
      <div className="mx-auto [95%] px-4 py-16">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <p className="mt-4 text-muted-foreground">
          No posts available yet. Please check back soon.
        </p>
      </div>
    );
  }

  const [featuredPost, ...rest] = posts;
  const gridPosts = rest.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Your Home With Lsa
        </h1>
      </header>

      <section className="mb-20">
        <FeaturedPost post={featuredPost} />
      </section>

      {gridPosts.length > 0 && (
        <section>
          <PostGrid posts={gridPosts} />
        </section>
      )}
    </div>
  );
}
