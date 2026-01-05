import { CatalogueListSectionV1 } from "@/config/types/pages/Catalogue/catalogue-page.types";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";
import { SectionReveal } from "@/shared/animations/section-reveal";

export function CatalogueList({ config }: { config: CatalogueListSectionV1 }) {
  if (config.enabled === false) return null;

  const cols = config.layout?.columns ?? 2;
  const gap = config.layout?.gapClassName ?? "gap-4 md:gap-6";
  const container = config.layout?.containerClassName ?? "container mx-auto";

  return (
    <section className="py-14 w-[90%] mx-auto">
      <div className={container}>
        <SectionReveal>
          {config.title ? (
            <h2 className="text-2xl md:text-3xl font-heading font-semibold">
              {config.title}
            </h2>
          ) : null}
        </SectionReveal>

        <ul
          className={[
            "mt-6 grid",
            gap,
            cols === 1
              ? "grid-cols-1"
              : cols === 3
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2",
          ].join(" ")}
        >
          {config.items.map((it, idx) => (
            <RevealFromSide
              key={it.title}
              direction="up"
              distance={18}
              delay={Math.min(idx * 0.06, 0.4)} // stagger, capped
              className="h-full"
            >
              <li className="h-full rounded-lg border bg-background p-4">
                <div className="font-medium">{it.title}</div>
              </li>
            </RevealFromSide>
          ))}
        </ul>
      </div>
    </section>
  );
}
