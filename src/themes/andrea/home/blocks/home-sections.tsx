import type {
  HomeSectionV1,
  LocalGallerySectionV1,
} from "@/config/types/pages/Home/home-sections.types";
import { HomeSections as ModaveHomeSections } from "@/themes/modave/home/blocks/home-sections";
import LocalGallery from "./local-gallery/local-gallery";

function isLocalGallerySection(
  s: HomeSectionV1,
): s is LocalGallerySectionV1 {
  return s.type === "localGallery";
}

// andrea owns localGallery (built for Emilia Duncan's bridal/beauty
// storefront); every other section type is generic e-commerce layout
// shared with modave, so unhandled types fall through to modave's
// dispatcher instead of being duplicated here.
export function HomeSections({ sections }: { sections?: HomeSectionV1[] }) {
  if (!sections?.length) return null;

  const localGallerySections = sections
    .filter(isLocalGallerySection)
    .filter((s) => s.enabled !== false);
  const otherSections = sections.filter((s) => s.type !== "localGallery");

  return (
    <div>
      {localGallerySections.map((section, idx) => (
        <LocalGallery key={`localGallery-${idx}`} config={section} />
      ))}
      <ModaveHomeSections sections={otherSections} />
    </div>
  );
}
