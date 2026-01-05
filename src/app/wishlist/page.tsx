import type { Metadata } from "next";
import { WishlistClient } from "@/features/wishlist/ui/wishlist-client";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return {
    title: `Wishlist | ${config.store.name}`,
    description: "View and manage your saved products.",
  };
}

export default function WishlistPage() {
  return <WishlistClient />;
}
