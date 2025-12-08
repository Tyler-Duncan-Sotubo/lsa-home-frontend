export const LATEST_POSTS = /* GraphQL */ `
  query LatestPostsExcludingFeatured {
    posts(
      first: 9
      where: {
        status: PUBLISH
        categoryNotIn: [7] # 👈 replace with your "featured" category ID
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }

        seoFields {
          metaTitle
          metaDescription
          seoExcerpt
        }

        author {
          node {
            name
          }
        }

        tags(first: 3) {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

// --- GraphQL query ---
export const POST_BY_SLUG = /* GraphQL */ `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      slug
      excerpt
      date
      content
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      author {
        node {
          name
        }
      }
      tags(first: 3) {
        nodes {
          name
          slug
        }
      }
      # Optional: ACF SEO group (if you added seoFields in WP)
      seoFields {
        metaTitle
        metaDescription
        seoExcerpt
      }
    }
  }
`;

// lib/graphql/queries.ts
export const PAGINATED_POSTS = /* GraphQL */ `
  query PaginatedPosts($first: Int!, $offset: Int!) {
    posts(
      where: {
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
        offsetPagination: { size: $first, offset: $offset }
      }
    ) {
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        seoFields {
          metaTitle
          metaDescription
          seoExcerpt
        }
        author {
          node {
            name
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
      }
      pageInfo {
        offsetPagination {
          total
        }
      }
    }
  }
`;
