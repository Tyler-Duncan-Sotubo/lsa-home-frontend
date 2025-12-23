// components/account/orders-tab.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";
import { cn } from "@/lib/utils";
import LsaLoading from "@/shared/ui/lsa-loading";

type WooOrderLineItem = {
  id: number;
  name: string;
  quantity: number;
  total: string;
  // assuming your API includes one of these:
  image?: {
    src?: string;
  };
  imageUrl?: string;
};

type WooOrder = {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  line_items: WooOrderLineItem[];
};

async function fetchOrders(): Promise<WooOrder[]> {
  const res = await fetch("/api/orders", {
    credentials: "include",
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.message || "Failed to fetch orders");
  }

  return res.json();
}

function getStatusClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "completed") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (normalized === "on-hold") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  if (normalized === "processing") {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "failed"
  ) {
    return "bg-red-100 text-red-800 border-red-200";
  }

  return "bg-slate-100 text-slate-800 border-slate-200";
}

function OrdersTab() {
  const { data, error, isLoading } = useQuery<WooOrder[], Error>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  if (isLoading) {
    return <LsaLoading />;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Could not load orders: {error.message}
      </p>
    );
  }

  const orders = data ?? [];

  if (!orders.length) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Your Orders</h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-[95%] max-w-5xl mx-auto my-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/account">
          <Button variant="link" className="p-0 text-primary-foreground">
            Your Account
          </Button>
        </Link>
        <IoChevronForward />
        <p>Your Orders</p>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Your Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track, return, or buy items again.
        </p>
      </div>

      <div className="space-y-10">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border bg-background p-4 sm:p-5 space-y-4"
          >
            {/* Top meta row like Amazon */}
            <div className="flex flex-wrap gap-4 justify-between border-b pb-3 text-xs sm:text-sm">
              <div>
                <div className="font-semibold">Order placed</div>
                <div>{new Date(order.date_created).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="font-semibold">Total</div>
                <div>{formatNaira(order.total)}</div>
              </div>

              <div className="text-left sm:text-right">
                <div className="font-semibold">Order #{order.id}</div>
                <div className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                      getStatusClasses(order.status)
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {order.line_items.map((item) => {
                const imageUrl = item.image?.src || item.imageUrl || undefined;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                  >
                    {/* Product image */}
                    {imageUrl && (
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product info */}
                    <div className="flex-1">
                      <div className="text-sm font-medium leading-snug">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Qty: {item.quantity}
                      </div>
                      <div className="text-sm font-semibold mt-2">
                        {formatNaira(item.total)}
                      </div>
                    </div>

                    {/* Actions like Amazon */}
                    <div className="flex sm:flex-col gap-2 sm:items-stretch">
                      <button className="border rounded-full px-3 py-1 text-xs font-medium hover:bg-muted">
                        Buy it again
                      </button>
                      <button className="border rounded-full px-3 py-1 text-xs hover:bg-muted">
                        View order details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersTab;

const formatNaira = (value: string | number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(value));
