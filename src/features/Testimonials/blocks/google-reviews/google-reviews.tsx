import { HiMiniStar } from "react-icons/hi2";
import type { GoogleReviewsSectionV1 } from "@/config/types/pages/Testimonials/testimonials-sections.types";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <HiMiniStar
          key={i}
          className={`size-4 ${i < rating ? "text-primary" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

// Google Reviews section — real, imported review data (not the
// hand-authored TestimonialsSectionV1 used on the homepage, which is a
// different, simpler shape). Generic/shared: any store can use this.
export function GoogleReviewsSection({
  config,
}: {
  config: GoogleReviewsSectionV1;
}) {
  if (config.enabled === false) return null;
  if (!config.reviews?.length) return null;

  const columns = config.layout?.columns ?? 2;
  const columnsClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

  const summary = config.summary;

  return (
    <section className="w-[95%] mx-auto py-16 md:py-20">
      {(config.title || config.subtitle || summary) && (
        <div className="mb-12 max-w-2xl">
          {config.title && (
            <h2 className="font-heading text-3xl md:text-4xl font-normal text-foreground">
              {config.title}
            </h2>
          )}
          {config.subtitle && (
            <p className="mt-3 text-lg text-muted-foreground">
              {config.subtitle}
            </p>
          )}

          {summary && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {summary.averageRating != null && (
                <div className="flex items-center gap-2">
                  <Stars rating={Math.round(summary.averageRating)} />
                  <span className="text-lg font-semibold text-foreground">
                    {summary.averageRating}
                  </span>
                </div>
              )}
              {summary.reviewCount != null && (
                <span className="text-muted-foreground">
                  · {summary.reviewCount} reviews
                </span>
              )}
              {summary.profileUrl && (
                <a
                  href={summary.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  View on Google
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className={`grid ${columnsClass} gap-6`}>
        {config.reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-border bg-background p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-foreground">
                  {review.author}
                </div>
                <div className="text-xs text-muted-foreground">
                  {review.isLocalGuide && "Local Guide · "}
                  {review.reviewCount != null &&
                    `${review.reviewCount} reviews · `}
                  {review.date}
                </div>
              </div>
              <Stars rating={review.rating} />
            </div>

            <p className="mt-4 text-base text-foreground">{review.quote}</p>

            {review.ownerReply && (
              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="text-xs font-semibold text-foreground">
                  Owner response · {review.ownerReply.date}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {review.ownerReply.message}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
