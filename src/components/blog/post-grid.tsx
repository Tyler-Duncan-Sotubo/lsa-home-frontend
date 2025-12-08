// components/blog/PostGrid.tsx
import type { Post } from "@/lib/graphql/type";
import PostCard from "./post-card";

type PostGridProps = {
  posts: Post[];
};

export default function PostGrid({ posts }: PostGridProps) {
  if (!posts.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
