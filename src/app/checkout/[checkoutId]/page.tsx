import { CheckoutClient } from "@/features/checkout/ui/checkout-client";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ checkoutId: string }>;
}) {
  const { checkoutId } = await params;
  return <CheckoutClient checkoutId={checkoutId} />;
}
