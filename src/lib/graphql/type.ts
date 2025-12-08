export type SeoFields = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  excerpt?: string | null;
};

// export type Post = {
//   id: string;
//   slug: string;
//   title: string;
//   date: string;
//   excerpt?: string;
//   featuredImage?: {
//     node?: {
//       sourceUrl?: string;
//       altText?: string;
//     } | null;
//   } | null;
//   author?: {
//     node?: {
//       name?: string;
//     } | null;
//   } | null;
//   tags?: {
//     nodes: { name: string; slug: string }[];
//   };
//   seoFields?: SeoFields | null;
// };

export type LatestPostsData = {
  posts: {
    nodes: Post[];
  };
};

// lib/graphql/type.ts (or wherever)
export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
  seoFields?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    seoExcerpt?: string | null;
  } | null;
  author?: {
    node?: {
      name?: string;
    } | null;
  } | null;
  tags?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  } | null;
};

export type PaginatedPostsData = {
  posts: {
    nodes: Post[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};
