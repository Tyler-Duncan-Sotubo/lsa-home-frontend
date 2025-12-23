import { NavItem } from "@/features/navigation/types/types";

export const mainNav: NavItem[] = [
  {
    label: "Beds",
    href: "/",
    type: "mega",
    sections: [
      {
        title: "Shop",
        items: [
          { label: "All Beds", href: "/collections/all-beds" },
          {
            label: "Bed Frames",
            href: "/collections/bed-frames",
          },
          {
            label: "Headboards",
            href: "/collections/headboards",
          },
          {
            label: "Bedroom Bundles",
            href: "/collections/bedroom-bundles",
          },
        ],
      },
      {
        title: "Trending",
        items: [
          { label: "Upholstered Beds", href: "/collections/upholstered-beds" },
          {
            label: "Wooden Frames",
            href: "/collections/wooden-bed-frames",
          },
          {
            label: "Adjustable Bases",
            href: "/collections/adjustable-bases",
          },
          { label: "Best Sellers", href: "/collections/best-sellers" },
        ],
      },
    ],
    feature: {
      label: "Shop Bed Frames",
      href: "/collections/bed-frames",
      image:
        "https://lsahome.instawp.site/wp-content/uploads/2025/12/IMG_9834-scaled.webp",
      description:
        "Upgrade your sleep setup with beautifully built frames designed for comfort, support, and timeless style.",
    },
  },

  {
    label: "Mattresses",
    href: "/pages/all-mattresses",
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
        title: "Shop All Things Mattresses",
        items: [
          {
            label: "Sublime Mattress",
            href: "/products/sublime-mattress",
            badge: "Best Seller",
            description:
              "Premium comfort and deep support engineered for cooler nights and truly restorative sleep.",
          },
          {
            label: "Mattress Protector",
            href: "/collections/mattress-protectors",
            description:
              "Breathable, waterproof protection that keeps your mattress fresh, clean, and lasting longer.",
          },
          {
            label: "Mattress Topper",
            href: "/collections/mattress-toppers",
            badge: "New",
            description:
              "A plush, cloud-like layer that enhances softness and elevates your overall sleep experience.",
          },
        ],
      },
    ],
    feature: {
      label: "Shop Signature Mattress",
      href: "/products/signature-mattress",
      image:
        "https://lsahome.instawp.site/wp-content/uploads/2025/12/LSA-HOME03-07-2401575-scaled.webp",
      description:
        "The Signature Mattress offers superior comfort and support for a better night's sleep.",
    },
  },
  { label: "Kids", href: "/" },
  { label: "Bath", href: "/pages/all-baths" },
  { label: "Bundle Savings", href: "/" },
  { label: "New Arrivals", href: "/" },
  { label: "Sales & Offers", href: "/" },
  { label: "Help & Advice", href: "/" },
];
