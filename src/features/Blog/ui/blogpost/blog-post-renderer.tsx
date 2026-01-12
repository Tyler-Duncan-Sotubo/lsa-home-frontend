/* eslint-disable @typescript-eslint/no-explicit-any */
import FloatingShare from "@/features/Blog/ui/FloatingShare";
import { BlogPostHero } from "@/features/Blog/ui/bloghero.tsx/blog-post-hero";
import { BlogPostHeroTwo } from "@/features/Blog/ui/bloghero.tsx/blog-post-hero-two";
import { BlogPostBody } from "@/features/Blog/ui/blogpost/blog-post-body";
import { BlogPostHeroThree } from "../bloghero.tsx/blog-post-hero-three";

export function BlogPostRenderer({
  post,
  canonicalUrl,
  config,
}: {
  post: any;
  canonicalUrl: string;
  config: any;
}) {
  const postCfg = config?.pages?.blog?.post;
  const variant: "V1" | "V2" | "V3" = postCfg?.variant ?? "V1";

  const showShare = postCfg?.ui?.showShare !== false;

  const Hero =
    variant === "V2"
      ? BlogPostHeroTwo
      : variant === "V3"
      ? BlogPostHeroThree
      : BlogPostHero;

  return (
    <article>
      {showShare ? (
        <FloatingShare
          title={post.title}
          url={canonicalUrl}
          summary={post.seoDescription ?? post.excerpt ?? undefined}
          tags={[]}
          offsetTop={160}
        />
      ) : null}

      <Hero post={post} />
      <BlogPostBody html={post.content ?? ""} />
    </article>
  );
}
