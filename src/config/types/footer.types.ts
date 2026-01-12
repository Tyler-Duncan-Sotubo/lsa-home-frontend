export type FooterConfigV1 = {
  variant?: "V1" | "V2" | "APP";

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
    payments?: {
      enabled: boolean;
      methods: { [key in PaymentMethod]?: boolean }; // selected in admin
    };
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

  appFooter?: {
    enabled: boolean;
    // show only on certain routes (optional)
    includeRoutes?: string[]; // e.g. ["/shop", "/category", "/product"]
    excludeRoutes?: string[]; // e.g. ["/checkout"]

    // what buttons to show (and in what order)
    items: Array<
      | {
          type: "shop";
          label?: string;
          href?: string; // default "/shop"
          // if you're already on /shop, this can open filters instead of navigating
          onActive?: "openFilter" | "noop";
        }
      | {
          type: "category";
          label?: string;
          href?: string; // default "/category"
        }
      | {
          type: "wishlist";
          label?: string;
          href?: string; // default "/wishlist"
        }
      | {
          type: "cart";
          label?: string;
          href?: string; // default "/cart"
          // if you use a cart drawer/sheet
          openDrawer?: boolean;
        }
      | {
          type: "checkout";
          label?: string;
          href?: string; // default "/checkout"
        }
      | {
          // for anything else: “Add to cart”, “Buy now”, “Help”, etc.
          type: "custom";
          label: string;
          href?: string;
          action?:
            | "addToCart"
            | "buyNow"
            | "openFilter"
            | "openCart"
            | "checkout";
          // show only on certain pages
          showOnRoutes?: string[];
          hideOnRoutes?: string[];
        }
    >;
  };
};

export type PaymentMethod =
  | "visa"
  | "mastercard"
  | "verve"
  | "amex"
  | "discover"
  | "paypal"
  | "apple_pay"
  | "google_pay"
  | "bank_transfer";
