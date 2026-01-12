import { SearchPageClient } from "@/features/Search/ui/search-page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products | Serene",
  description:
    "Search our full range of hospitality products including bedding, bath essentials, and commercial furnishings.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/search",
  },
};

export default function Page() {
  return <SearchPageClient />;
}
