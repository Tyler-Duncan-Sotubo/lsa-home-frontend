export type FooterConfigV1 = {
  variant?: "V1" | "V2";

  brand?: {
    logoUrl?: string;
    blurb?: string;
  };

  columns?: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;

  contacts?: {
    title?: string;
    lines: string[];
  };

  newsletter?: {
    enabled: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
    ctaLabel?: string;
  };

  social?: Array<{
    platform: "facebook" | "instagram" | "twitter" | "linkedin" | "youtube";
    href: string;
  }>;

  bottomBar?: {
    leftText?: string;
    rightText?: string;
  };

  // ✅ NEW
  whatsapp?: {
    enabled: boolean;
    title?: string; // "Start a Conversation"
    intro?: string; // "Hi! Click one of our members..."
    note?: string; // "The team typically replies..."
    agents?: Array<{
      name: string; // "Serene Hospitality"
      role?: string; // "Serene Hospitality Manager"
      phone: string; // "234XXXXXXXXXX" (digits only recommended)
      prefill?: string; // optional prefilled message
    }>;
    position?: "bottom-right" | "bottom-left";
  };
};
