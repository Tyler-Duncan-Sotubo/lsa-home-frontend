// contact.types.ts
import { CtaConfig } from "./image-types";

export type ContactLocationV1 = {
  label: string; // "LAGOS", "ABUJA", "IKEJA"
  address: string; // full address line(s)
};

export type SocialLinkV1 = {
  platform:
    | "instagram"
    | "facebook"
    | "x"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "whatsapp";
  label?: string; // optional display label
  href?: string; // optional full URL
  handle?: string; // "@serenehospitality"
};

export type ContactSectionV1 = {
  type: "contact";
  enabled?: boolean;

  title?: string;
  subtitle?: string;

  info?: {
    phone?: string[];
    email?: string[];

    /** Backward compatible: keep old single address + new multi-location */
    address?: string;
    locations?: ContactLocationV1[];

    hours?: string;
    whatsapp?: string;

    /** Social accounts */
    social?: SocialLinkV1[];
  };

  cta?: CtaConfig;

  form?: {
    enabled?: boolean;
    fields?: ("name" | "email" | "phone" | "company" | "message" | "subject")[];
    submitLabel?: string;
    successMessage?: string;
    privacyNote?: string;
  };

  layout: ContactSectionLayoutV1;
};

export type ContactSectionLayoutV1 =
  | {
      variant: "compact";
      image: { src: string; alt?: string };
      imagePosition?: "right";
      columns?: 2;
      containerClassName?: string;
    }
  | {
      variant: "full";
      /**
       * Top area: details + form
       * Bottom area: map
       */
      top?: {
        columns?: 1 | 2; // default 2
        order?: ("details" | "form")[]; // default ["details","form"]
        gapClassName?: string; // e.g. "gap-10"
      };

      map?: {
        enabled?: boolean; // default true if embedUrl provided
        embedUrl?: string; // Google Maps embed link
        heightClassName?: string; // e.g. "h-[360px]"
        title?: string; // iframe title
      };

      containerClassName?: string;
    }
  | {
      variant: "stacked";
      /**
       * Row 1: form (full width)
       * Row 2: details + map side-by-side
       */
      formRow?: {
        enabled?: boolean; // default true
        containerClassName?: string; // e.g. "max-w-3xl"
      };

      bottomGrid?: {
        columns?: 1 | 2; // default 2
        order?: ("details" | "map")[]; // default ["details","map"]
        gapClassName?: string; // e.g. "gap-10"
      };

      map?: {
        enabled?: boolean; // default true if embedUrl provided
        embedUrl?: string;
        heightClassName?: string;
        title?: string;
      };

      containerClassName?: string;
    };
