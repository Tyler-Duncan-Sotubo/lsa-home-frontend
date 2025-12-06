import { NavItem } from "@/components/navigation/types";

export const mainNav: NavItem[] = [
  {
    label: "Gifts",
    href: "/collections/holiday-gift-guide",
    type: "mega",
    sections: [
      {
        title: "Shop",
        items: [
          { label: "All Gifts", href: "/collections/holiday-gift-guide" },
          {
            label: "Gifts Under $150",
            href: "/collections/holiday-gift-guide?filter.p.m.filter.category_single_line_text_with_list_of_values=Gifts%20Under%20%24150",
          },
          {
            label: "Holiday Exclusives",
            href: "/collections/holiday-gift-guide?filter.p.m.filter.category_single_line_text_with_list_of_values=Holiday%20Exclusives",
          },
          {
            label: "Bundle Savings",
            href: "/collections/holiday-gift-guide?filter.p.m.filter.category_single_line_text_with_list_of_values=Bundle%20Savings",
          },
        ],
      },
      {
        title: "Trending",
        items: [
          { label: "Robes", href: "/collections/robes" },
          {
            label: "Throw Blankets",
            href: "/collections/throw-blankets-pillow-covers",
          },
          {
            label: "Mulberry Silk",
            href: "/collections/mulberry-silk-collection",
          },
          { label: "Best Sellers", href: "/collections/best-sellers" },
        ],
      },
    ],
    feature: {
      label: "Shop the Gift Guide",
      href: "/collections/holiday-gift-guide",
      image:
        "https://cdn.shopify.com/s/files/1/0951/7126/files/BKL_25-07_Holiday_Film_1572x_9x8_WO.jpg?v=1761687456",
      description:
        "Get more, get merry. Shop guaranteed good gifts like robes, throws, Waffle, and more.",
    },
  },
  {
    label: "Bed",
    href: "/pages/all-bed",
    type: "mega",
    sections: [
      {
        title: "Shop",
        items: [
          { label: "All Bedding", href: "/pages/all-bed" },
          { label: "All Sheets", href: "/collections/all-sheets" },
          { label: "Bedding Bundles", href: "/collections/sheet-bundles" },
          {
            label: "Comforters & Pillows",
            href: "/collections/comforters-pillows",
          },
          { label: "Duvet Covers", href: "/collections/duvet-covers" },
        ],
      },
      {
        title: "Shop by Fabric",
        items: [
          {
            label: "Luxe Sateen",
            href: "/collections/luxe-sateen-sheets",
            badge: "Best Seller",
            description:
              "Our softest, smoothest, most luxurious sheets with a subtle sheen.",
          },
          {
            label: "Classic Percale",
            href: "/collections/classic-percale-sheets",
          },
          {
            label: "Washed Classic Percale",
            href: "/collections/washed-classic-sheets",
            badge: "New",
          },
          {
            label: "Washed European Linen",
            href: "/collections/washed-linen-sheets",
          },
        ],
      },
    ],
    feature: {
      label: "Shop Luxe Sateen",
      href: "/collections/luxe-sateen-sheets",
      image:
        "https://cdn.shopify.com/s/files/1/0951/7126/files/BKL_25-08_HolidayOverheads_Look2_638_x_9x8_WO.jpg?v=1761687457",
      description:
        "Get guest-ready with irresistibly smooth, luxuriously soft Luxe Sateen.",
    },
  },
  { label: "Bath", href: "/pages/all-bath" },
  { label: "Bundle Savings", href: "/pages/all-bundles" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
  { label: "Home", href: "/collections/throw-blankets-pillow-covers" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Sale", href: "/collections/last-call" },
];
