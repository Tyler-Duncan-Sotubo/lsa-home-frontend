import { OrderDetails } from "@/features/orders/ui/order-details";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo, // favicon / icons
    pageSeo: {
      title: "Order details",
      description: "View your order details and status.",
    },
  });
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetails orderId={orderId} />;
}
