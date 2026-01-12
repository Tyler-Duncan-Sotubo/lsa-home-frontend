/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import type { StorefrontBlogPost } from "../../types/types";
import { BlogListOne, BlogPostLite } from "./blog-list-one";
import { BlogListTwo } from "./blog-list-two";

export type BlogListVariant = "V1" | "V2";

function toLite(p: StorefrontBlogPost): BlogPostLite {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: (p as any).excerpt ?? null,
    coverImageUrl: (p as any).coverImageUrl ?? null,
    publishedAt: (p as any).publishedAt ?? null,
  };
}

export function BlogListRenderer({
  variant,
  posts,
}: {
  variant: BlogListVariant;
  posts: StorefrontBlogPost[];
}) {
  if (!posts?.length) return null;

  const lite = posts.map(toLite);

  if (variant === "V2") return <BlogListTwo posts={lite} />;

  // default V1
  return <BlogListOne posts={lite} gridLimit={8} />;
}
