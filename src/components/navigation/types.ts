export type NavSectionItem = {
  label: string;
  href: string;
  badge?: string;
  description?: string;
};

export type NavSection = {
  title: string;
  items: NavSectionItem[];
};

export type NavFeature = {
  label: string;
  href: string;
  image: string;
  description: string;
};

export type NavItem =
  | {
      label: string;
      href: string;
      type: "mega";
      sections: NavSection[];
      feature?: NavFeature;
    }
  | {
      label: string;
      href: string;
      type?: undefined;
    };
