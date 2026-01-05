import { listCustomerOrders } from "@/features/Pages/Account/orders/actions/orders";
import OrdersTabClient from "@/features/Pages/Account/orders/ui/orders-tab-client";
import { auth } from "@/lib/auth/auth";

export default async function OrdersPage() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  // You can redirect here if no token; keeping simple:
  if (!token) {
    return <p className="text-sm text-destructive">Unauthorized</p>;
  }

  const data = await listCustomerOrders({ limit: 50, offset: 0 }, token);

  return <OrdersTabClient initialData={data} />;
}
