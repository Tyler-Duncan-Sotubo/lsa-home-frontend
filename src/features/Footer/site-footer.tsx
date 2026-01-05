"use client";

import type { StorefrontConfigV1 } from "@/config/types/types";
import { FooterOne } from "@/features/Footer/footer-one";
import { FooterTwo } from "@/features/Footer/footer-two";
import { WhatsAppWidget } from "@/shared/marketing/whats-app-widget";

type Props = {
  config: StorefrontConfigV1;
};

export function SiteFooter({ config }: Props) {
  const footer = config.footer;
  if (!footer) return null;

  if (footer.variant === "V2") {
    return (
      <div>
        <WhatsAppWidget config={config?.footer?.whatsapp} />
        <FooterTwo footer={footer} config={config} />
      </div>
    );
  }

  return <FooterOne footer={footer} config={config} />;
}
