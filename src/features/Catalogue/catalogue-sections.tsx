"use client";

import { CatalogueSectionV1 } from "@/config/types/pages/Catalogue/catalogue-page.types";
import HeroCardSection from "../Hero/hero-card-section";
import AboutSplitSection from "../About/about-split-section";
import { CatalogueList } from "./catalogue-list-section";

export function CatalogueSections({
  sections,
}: {
  sections?: CatalogueSectionV1[];
}) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-20">
      {sections.map((section, idx) => {
        // ✅ Global enabled guard
        if (section.enabled === false) return null;

        switch (section.type) {
          case "heroCard":
            return <HeroCardSection key={idx} config={section} />;

          case "aboutSplit":
            return (
              <div key={idx} className="mb-20">
                <AboutSplitSection config={section} />
              </div>
            );

          case "catalogueList":
            return <CatalogueList key={idx} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
