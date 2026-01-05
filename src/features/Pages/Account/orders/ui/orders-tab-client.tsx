"use client";

import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import type { ListCustomerOrdersResponse } from "../actions/orders";

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

export default function OrdersTabClient({
  initialData,
}: {
  initialData: ListCustomerOrdersResponse;
}) {
  const orders = initialData?.items ?? [];
  const formatPrice = usePriceDisplay();

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
    <div className="space-y-6 mb-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/account">
          <Button variant="link" className="p-0">
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
            {/* top meta row */}
            <div className="flex flex-wrap gap-4 justify-between border-b pb-3 text-xs sm:text-sm">
              <div>
                <div className="font-semibold">Order placed</div>
                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="font-semibold">Total</div>
                {/* totalMinor -> naira */}
                <div>{formatPrice(String(order.totalMinor ?? 0))}</div>
              </div>

              <div className="text-left sm:text-right">
                <div className="font-semibold">
                  Order #{order.orderNumber ?? order.id}
                </div>
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

            {/* items */}
            {order.items?.length ? (
              <div className="space-y-3">
                {order.items.map((item) => {
                  const imageUrl = item.imageUrl ?? undefined;

                  // ✅ product route: /products/:id (fallback to slug, then no-link)
                  const productHref = item.product?.id
                    ? `/products/${item.product.slug}`
                    : null;

                  const productName =
                    item.product?.name?.trim() || item.name || "Item";

                  // ✅ item.totalMinor expected from API (minor units)
                  const itemTotal =
                    item.totalMinor != null
                      ? formatPrice(String(Number(item.totalMinor) / 100))
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                    >
                      {/* image */}
                      {imageUrl ? (
                        productHref ? (
                          <Link
                            href={productHref}
                            className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="h-full w-full object-cover"
                            />
                          </Link>
                        ) : (
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )
                      ) : null}

                      {/* info */}
                      <div className="flex-1">
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="text-sm font-medium leading-snug hover:underline"
                          >
                            {productName}
                          </Link>
                        ) : (
                          <div className="text-sm font-medium leading-snug">
                            {productName}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-1">
                          Qty: {item.quantity}
                        </div>

                        {itemTotal ? (
                          <div className="text-sm font-semibold mt-2">
                            {itemTotal}
                          </div>
                        ) : null}
                      </div>

                      {/* actions -> all go to product/id */}
                      <div className="flex sm:flex-col gap-2 sm:items-stretch">
                        {productHref && order.status === "paid" ? (
                          <>
                            <Link href={productHref}>
                              <button className="border rounded-full px-3 py-1 text-xs font-medium hover:bg-muted w-full">
                                Order again
                              </button>
                            </Link>

                            <Link href={`${productHref}#reviews`}>
                              <button className="border rounded-full px-3 py-1 text-xs hover:bg-muted w-full">
                                Write a review
                              </button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <button
                              disabled
                              className="border rounded-full px-3 py-1 text-xs font-medium opacity-50 cursor-not-allowed"
                            >
                              Order again
                            </button>
                            <button
                              disabled
                              className="border rounded-full px-3 py-1 text-xs opacity-50 cursor-not-allowed"
                            >
                              Write a review
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
