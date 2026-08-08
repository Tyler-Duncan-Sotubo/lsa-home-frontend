import type { ReactNode } from "react";
import { FaInstagram } from "react-icons/fa6";
import { MapPin, Phone, Mail } from "lucide-react";
import type { ContactSectionV1 } from "@/config/types/contact.types";

type MapCardsSection = ContactSectionV1 & {
  layout: Extract<ContactSectionV1["layout"], { variant: "mapCards" }>;
};

function normalizePhone(p?: string) {
  return p ? p.replace(/\s+/g, "") : "";
}

// andrea's homepage "get in touch" section — map on one side, a card
// grid of contact methods on the other, no form. Distinct component
// from the shared ContactSectionCompact (form + side image) other
// themes use; wired in via ThemeComponents.HomeContactSection.
export function ContactSection({ section }: { section?: ContactSectionV1 }) {
  const cfg: MapCardsSection | null =
    section && section.layout?.variant === "mapCards"
      ? (section as MapCardsSection)
      : null;

  if (!cfg) return null;

  const { title, subtitle, info, layout } = cfg;
  const mapPosition = layout.mapPosition ?? "left";
  const mapHeight = layout.map.heightClassName ?? "h-full min-h-[500px]";

  const social = info?.social?.find((s) => s.platform === "instagram");
  const location = info?.locations?.[0];
  const phone = info?.phone?.[0] ?? info?.whatsapp;
  const email = info?.email?.[0];

  type Card = {
    icon: ReactNode;
    title: string;
    description?: string;
    href?: string;
  };

  const cards: Card[] = [];

  if (social) {
    cards.push({
      icon: <FaInstagram className="size-6" />,
      title: social.handle ?? social.label ?? "Follow us",
      description: "Follow us on Instagram",
      href: social.href,
    });
  }
  if (location) {
    cards.push({
      icon: <MapPin className="size-6" />,
      title: location.address,
      description: location.label,
    });
  }
  if (phone) {
    cards.push({
      icon: <Phone className="size-6" />,
      title: phone,
      description: "Call or WhatsApp us",
      href: `https://wa.me/${normalizePhone(phone).replace(/^\+/, "")}`,
    });
  }
  if (email) {
    cards.push({
      icon: <Mail className="size-6" />,
      title: email,
      description: "Write us a message",
      href: `mailto:${email}`,
    });
  }

  const mapBlock = (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className={`w-full ${mapHeight}`}>
        <iframe
          title={layout.map.title ?? "Map"}
          src={layout.map.embedUrl}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );

  const detailsBlock = (
    <div>
      {title && (
        <h2 className="font-heading text-3xl md:text-4xl font-normal text-foreground">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-2 text-xl text-primary">{subtitle}</p>
      )}

      {cards.length > 0 && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
          {cards.map((card, i) => {
            const content = (
              <>
                <div className="text-primary">{card.icon}</div>
                <div className="mt-3 text-lg font-semibold text-foreground">
                  {card.title}
                </div>
                <div className="mt-1 text-base text-muted-foreground">
                  {card.description}
                </div>
              </>
            );

            return card.href ? (
              <a
                key={i}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={card.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {content}
              </a>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <section className="min-h-[85svh] flex items-center py-16 md:py-20">
      <div className="w-[95%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        {mapPosition === "left" ? (
          <>
            {mapBlock}
            {detailsBlock}
          </>
        ) : (
          <>
            {detailsBlock}
            {mapBlock}
          </>
        )}
      </div>
    </section>
  );
}
