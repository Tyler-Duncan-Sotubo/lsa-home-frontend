import { PageSeoConfigV1 } from "../../seo-page.types";

export type AccountNavItemV1 = {
  label: string;
  href?: string;
  action?: "logout"; // future-proof for actions
};

export type AccountHomePageConfigV1 = {
  version: 1;
  seo?: PageSeoConfigV1;
  ui?: {
    variant?: "V1";
    greetingLines?: string[]; // ["Hello, how", "are you?"]
    userLabel?: string; // "My space" or user name

    nav?: AccountNavItemV1[];
  };
};
