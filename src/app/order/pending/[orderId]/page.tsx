import { OrderDetails } from "@/features/orders/ui/order-details";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetails orderId={orderId} />;
}
