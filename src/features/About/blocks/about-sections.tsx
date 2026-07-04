"use client";

import { AboutSectionV1 } from "@/config/types/pages/About/about-sections.types";
import AboutHeroSection from "../../Hero/hero-section";
import AboutSplitSection from "./splits/about-split/about-split";
import AboutValuesSection from "./about-values/about-values";
import AboutSuppliesScrollerSection from "./about-supplies-scroller/about-supplies-scroller";
import AboutStatsSplitSection from "./splits/about-stats-split/about-stats-split";
import BrandGrid from "./brand-grid/brand-grid";

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
