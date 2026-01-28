import { FooterConfigV1 } from "./footer.types";
import { HeaderConfigV1 } from "./header-types";
import { AboutPageConfigV1 } from "./pages/About/about-page.types";
import { AccountPageConfigV1 } from "./pages/Account/account-page.types";
import { BlogPageConfigV1 } from "./pages/Blog/blog-page.types";
import { CataloguePageConfigV1 } from "./pages/Catalogue/catalogue-page.types";
import { CollectionsPageConfigV1 } from "./pages/Collections/collections-page.types";
import { ContactPageConfigV1 } from "./pages/Contact/contact-page.types";
import { HomePageConfigV1 } from "./pages/Home/home-page.types";
import { SeoConfigV1 } from "./seo.types";
import { ThemeConfigV1 } from "./theme-types";

export type StorefrontConfigV1 = {
  version: 1;
  /* ---------------------------------- */
  /* Store identity                      */
  /* ---------------------------------- */

  store: {
    id: string;
    name: string;
    locale?: string;
    currency?: {
      code: string;
      locale: string;
      fractionDigits: number;
    };
  };

  /* ---------------------------------- */
  /* Theme                               */
  /* ---------------------------------- */
  theme?: ThemeConfigV1;

  /* ---------------------------------- */
  /* SEO                                 */
  /* ---------------------------------- */
  seo?: SeoConfigV1;
  ui?: {
    systemPage?: {
      kind: "store-not-found" | "maintenance";
      title?: string;
      description?: string;
      image?: {
        src: string;
        alt?: string;
      };
    };
    quickView?: {
      enabled?: boolean;
      detailsVariant?: "V1" | "V2";
    };
    pricing?: {
      showPriceInDetails?: "always" | "loggedInOnly" | "never"; // default "always"
      priceRange?: boolean;
    };
    product?: {
      galleryVariant?: "V1" | "V2" | "V3"; // default "V1"
      productDetails?: {
        context?: "CART" | "QUOTE"; // optional if you have a default
        variant?: "V1" | "V2"; // grows later
        showInfoSections?: boolean;
      };
      recommendations?: {
        variant?: "STACKED" | "TABBED"; // default STACKED
        defaultTab?: "recent" | "collection";
      };
      showWishlistButton?: boolean;
      productCardVariant?: "DEFAULT" | "HOVER_ACTIONS";
    };
    account?: {
      headerNav: {
        showRewardIcon?: boolean;
        showWishlistIcon?: boolean;
        showOurStoresIcon?: boolean;
      };
    };
    headerMenu?: {
      blog?: boolean;
      about?: boolean;
      contact?: boolean;
    };
  };

  /* ---------------------------------- */
  /* Pages & Layout                     */
  /* ---------------------------------- */

  header: HeaderConfigV1;
  footer?: FooterConfigV1;
  pages?: {
    home?: HomePageConfigV1;
    about?: AboutPageConfigV1;
    contact?: ContactPageConfigV1;
    catalogue?: CataloguePageConfigV1;
    blog?: BlogPageConfigV1;
    account?: AccountPageConfigV1;
    collections?: CollectionsPageConfigV1;
  };
};
