"use client";

import type { ContactPageSectionV1 } from "@/config/types/pages/Contact/contact-sections.types";

import HeroSection from "../common/hero-section";
import { ContactSection } from "./contact-section-full";

export function ContactSections({
  sections,
}: {
  sections?: ContactPageSectionV1[];
}) {
  if (!sections?.length) return null;

  return (
    <div className="space-y-10">
      {sections.map((section, idx) => {
        if (section.enabled === false) return null;

        switch (section.type) {
          case "Hero":
            return <HeroSection key={idx} config={section} />;

          case "contact":
            return <ContactSection key={idx} section={section} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
