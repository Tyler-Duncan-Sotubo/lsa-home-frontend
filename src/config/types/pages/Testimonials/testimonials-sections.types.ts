/**
 * Google Reviews section — real, imported review data with the full
 * detail a review platform shows (author, rating, date, and the
 * business owner's reply where one exists). Generic/shared: any store
 * can use this, not specific to one theme or business.
 */
export type GoogleReviewOwnerReplyV1 = {
  date: string; // e.g. "a month ago" — pre-formatted, platform-relative
  message: string;
};

export type GoogleReviewV1 = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string; // e.g. "a month ago"
  quote: string;
  isLocalGuide?: boolean;
  reviewCount?: number; // e.g. author's total review count on the platform
  ownerReply?: GoogleReviewOwnerReplyV1;
};

export type GoogleReviewsSectionV1 = {
  type: "googleReviews";
  enabled?: boolean;

  title?: string; // e.g. "What Our Clients Say"
  subtitle?: string;

  /** Aggregate rating shown at the top, e.g. "4.9 · 51 reviews" */
  summary?: {
    businessName?: string;
    address?: string;
    averageRating?: number; // e.g. 4.9
    reviewCount?: number; // e.g. 51
    profileUrl?: string; // link to the Google Business profile/reviews
  };

  reviews: GoogleReviewV1[];

  layout?: {
    columns?: 1 | 2 | 3; // default 2
  };
};

export type TestimonialsPageSectionV1 = GoogleReviewsSectionV1;
