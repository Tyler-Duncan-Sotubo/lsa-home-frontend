import { TestimonialsPageSectionV1 } from "@/config/types/pages/Testimonials/testimonials-sections.types";
import { GoogleReviewsSection } from "./google-reviews/google-reviews";

export function TestimonialsSections({
  sections,
}: {
  sections?: TestimonialsPageSectionV1[];
}) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => {
        switch (section.type) {
          case "googleReviews":
            if (section.enabled === false) return null;
            return <GoogleReviewsSection key={idx} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
