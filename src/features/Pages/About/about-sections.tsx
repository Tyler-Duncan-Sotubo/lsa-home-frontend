"use client";

import { AboutSectionV1 } from "@/config/types/pages/About/about-sections.types";
import AboutHeroSection from "../common/hero-section";
import AboutSplitSection from "./about-split-section";
import AboutValuesSection from "./about-values-section";
import AboutSuppliesScrollerSection from "./about-supplies-scroller-section";
import AboutStatsSplitSection from "./about-stats-split-section";
import BrandGrid from "./brand-grid";

export function AboutSections({ sections }: { sections?: AboutSectionV1[] }) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => {
        switch (section.type) {
          case "aboutHero":
            if (section.enabled === false) return null;
            return <AboutHeroSection key={idx} config={section} />;

          case "aboutSplit":
            if (section.enabled === false) return null;
            return <AboutSplitSection key={idx} config={section} />;

          case "aboutValues":
            if (section.enabled === false) return null;
            return <AboutValuesSection key={idx} config={section} />;

          case "aboutSuppliesScroller":
            if (section.enabled === false) return null;
            return <AboutSuppliesScrollerSection key={idx} config={section} />;

          case "aboutStatsSplit":
            if (section.enabled === false) return null;
            return <AboutStatsSplitSection key={idx} config={section} />;

          case "brandGrid":
            if (section.enabled === false) return null;
            return <BrandGrid key={idx} config={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
