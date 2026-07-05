"use client";

import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import {
  getOrderStatusClasses,
  orderStatusLabel,
} from "@/shared/utils/order-status";
import type { ListCustomerOrdersResponse } from "../actions/orders";

export default function OrdersTabClient({
  initialData,
}: {
  initialData: ListCustomerOrdersResponse;
}) {
  const orders = initialData?.items ?? [];
  const formatPrice = usePriceDisplay();

  if (!orders.length) {
    return (
      <div className="max-w-md py-20 mx-auto text-center md:py-28">
        <h1 className="text-3xl font-semibold tracking-tight">No orders yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          When you place an order, it&apos;ll show up here so you can track it,
          reorder, or leave a review.
        </p>
        <Button asChild className="h-12 px-10 mt-8">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-10 space-y-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground hover:underline">
          Your Account
        </Link>
        <IoChevronForward className="h-3.5 w-3.5" />
        <p className="text-foreground">Your Orders</p>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track, reorder, or review items from past orders.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const detailHref = `/order/pending/${order.id}`;
          const canReorder = order.status === "paid";

          return (
            <div key={order.id} className="border shadow-sm rounded-xl bg-card">
              {/* meta row */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b">
                <div className="flex flex-wrap text-xs gap-x-8 gap-y-2 sm:text-sm">
                  <div>
                    <p className="text-muted-foreground">Order placed</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">
                      {formatPrice(String(order.totalMinor ?? 0))}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Order number</p>
                    <p className="font-medium">
                      {order.orderNumber ?? order.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      getOrderStatusClasses(order.status),
                    )}
                  >
                    {orderStatusLabel(order.status)}
                  </Badge>

                  <Button asChild size="sm">
                    <Link href={detailHref}>View order</Link>
                  </Button>
                </div>
              </div>

              {/* items */}
              {order.items?.length ? (
                <div className="divide-y">
                  {order.items.map((item) => {
                    const imageUrl = item.imageUrl ?? undefined;

                    const productHref = item.product?.id
                      ? `/products/${item.product.slug}`
                      : null;

                    const productName =
                      item.product?.name?.trim() || item.name || "Item";

                    const itemTotal =
                      item.totalMinor != null
                        ? formatPrice(String(Number(item.totalMinor) / 100))
                        : null;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center"
                      >
                        {imageUrl ? (
                          <Link
                            href={productHref ?? "#"}
                            className="flex items-center justify-center w-20 h-20 overflow-hidden rounded-lg shrink-0 bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={productName}
                              className="object-cover w-full h-full"
                            />
                          </Link>
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-[10px] text-muted-foreground">
                            No image
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {productHref ? (
                            <Link
                              href={productHref}
                              className="text-sm font-medium leading-snug hover:underline"
                            >
                              {productName}
                            </Link>
                          ) : (
                            <p className="text-sm font-medium leading-snug">
                              {productName}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                          {itemTotal && (
                            <span className="text-sm font-semibold">
                              {itemTotal}
                            </span>
                          )}

                          <div className="flex gap-2">
                            <Button
                              asChild={canReorder && !!productHref}
                              size="sm"
                              disabled={!canReorder || !productHref}
                              className="h-8 text-xs rounded-full"
                            >
                              {canReorder && productHref ? (
                                <Link href={productHref}>Order again</Link>
                              ) : (
                                <span>Order again</span>
                              )}
                            </Button>

                            <Button
                              asChild={canReorder && !!productHref}
                              variant="clean"
                              size="sm"
                              disabled={!canReorder || !productHref}
                              className="h-8 text-xs rounded-full"
                            >
                              {canReorder && productHref ? (
                                <Link href={`${productHref}#reviews`}>
                                  Write a review
                                </Link>
                              ) : (
                                <span>Write a review</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
