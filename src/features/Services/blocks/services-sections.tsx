import { ServicesPageSectionV1 } from "@/config/types/pages/Services/services-sections.types";
import AboutHeroSection from "@/features/Hero/hero-section";
import { PricingCardsSection } from "@/themes/modave/home/blocks/pricing-cards/pricing-cards";

export function ServicesSections({
  sections,
}: {
  sections?: ServicesPageSectionV1[];
}) {
  if (!sections?.length) return null;

  return (
    <div>
      {sections.map((section, idx) => {
        switch (section.type) {
          case "Hero":
            if (section.enabled === false) return null;
            return <AboutHeroSection key={idx} config={section} />;

          case "pricingCards":
            return <PricingCardsSection key={idx} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
