"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useTransition } from "react";
import { formatPriceDisplay } from "@/shared/utils/format-naira";
import { getStorefrontOrderById } from "../actions/orders";
import { BankDetails, BankTransferCard } from "./bank-transfer-card";
import Image from "next/image";

type Props = {
  orderId: string;
};

export function OrderDetails({ orderId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    startTransition(async () => {
      try {
        setError(null);
        const data = await getStorefrontOrderById(orderId);
        setOrder(data);
      } catch (e: any) {
        setOrder(null);
        setError(e?.message ?? e?.error?.message ?? "Failed to load order");
      }
    });
  }, [orderId, startTransition]);

  const items = useMemo(() => order?.items ?? [], [order]);

  if (isPending && !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-1/2 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
          <div className="h-40 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border p-5">
          <h1 className="text-xl font-semibold">Order</h1>
          <p className="mt-2 text-sm text-destructive">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Order ID: {orderId}
          </p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const bankDetails: BankDetails = {
    bankName: "GTBank",
    accountName: "Acme Stores Ltd",
    accountNumber: "0123456789",
    note: `Use order ${
      order?.orderNumber ? `#${order.orderNumber}` : order?.id
    } as payment reference.`,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Order info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header (your existing card) */}
          <div className="rounded-xl border p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Order</h1>
                <p className="mt-1 text-sm text-muted-foreground break-all">
                  {order?.orderNumber ? `#${order.orderNumber}` : order?.id}
                </p>
              </div>

              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize">
                {String(order?.status ?? "unknown").replaceAll("_", " ")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="text-muted-foreground text-xs">Subtotal</div>
                <div className="mt-1 font-semibold">
                  {order?.subtotal != null
                    ? formatPriceDisplay(String(order.subtotal))
                    : "—"}
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3">
                <div className="text-muted-foreground text-xs">Shipping</div>
                <div className="mt-1 font-semibold">
                  {order?.shippingTotal != null
                    ? formatPriceDisplay(String(order.shippingTotal))
                    : "—"}
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 col-span-2">
                <div className="text-muted-foreground text-xs">Total</div>
                <div className="mt-1 text-lg font-semibold">
                  {order?.total != null
                    ? formatPriceDisplay(String(order.total))
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Items (your existing items card) */}
          <div className="rounded-xl border">
            <div className="border-b p-5">
              <h2 className="text-lg font-semibold">Items</h2>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="divide-y">
              {items.map((it: any) => {
                const name = it?.name ?? "Item";
                const qty = Number(it?.quantity ?? 0);
                const lineTotal = it?.lineTotal ?? it?.line_total ?? null;
                const imageUrl = it?.imageUrl ?? it?.image_url ?? null;

                return (
                  <div
                    key={it?.id ?? `${name}-${qty}`}
                    className="p-5 flex gap-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                          fill
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium line-clamp-2">{name}</p>
                        <p className="font-semibold whitespace-nowrap">
                          {lineTotal != null
                            ? formatPriceDisplay(String(lineTotal))
                            : "—"}
                        </p>
                      </div>

                      <div className="mt-1 text-sm text-muted-foreground">
                        Qty: {qty}
                        {it?.sku ? (
                          <span className="ml-3">SKU: {it.sku}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Bank transfer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold">Payment</p>
            <p className="mt-1 text-xs text-muted-foreground">
              If you chose bank transfer, use the details below.
            </p>
          </div>

          <BankTransferCard
            details={bankDetails}
            onConfirmTransfer={() => {
              // optional: call an action to mark "transfer sent"
              // For now, just a UX placeholder
              alert("Thanks! We’ll verify your transfer shortly.");
            }}
          />
        </div>
      </div>
    </div>
  );
}
