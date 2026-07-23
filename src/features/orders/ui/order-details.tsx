"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import Image from "next/image";
import { HiLockClosed, HiCheckCircle, HiClock } from "react-icons/hi";
import { cn } from "@/lib/utils";
import { formatPriceDisplay } from "@/shared/utils/format-naira";
import {
  getOrderStatusClasses,
  orderStatusLabel,
} from "@/shared/utils/order-status";
import { Badge } from "@/shared/ui/badge";
import { BankDetails, BankTransferCard } from "./bank-transfer-card";
import { usePaymentMethods } from "@/features/checkout/hooks/use-payment-methods";
import { BankTransferEvidenceSection } from "./BankTransferEvidenceSection";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useStorefrontOrder } from "../hooks/use-order";
import { LoadingProgress } from "@/shared/ui/loading/loading-progress";

type Props = {
  orderId: string;
};

const PAID_STATUSES = ["paid", "completed"];

export function OrderDetails({ orderId }: Props) {
  const qc = useQueryClient();

  // Fetch available payment methods (includes bank details)
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    isError: paymentMethodsIsError,
  } = usePaymentMethods();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useStorefrontOrder(orderId);

  const items = useMemo(() => order?.items ?? [], [order]);

  const status = String(order?.status ?? "").toLowerCase();
  const isPaid = PAID_STATUSES.includes(status);

  // Determine if this order is bank transfer
  const paymentMethodType = String(
    order?.paymentMethodType ?? "",
  ).toLowerCase();
  const isBankTransfer = paymentMethodType === "bank_transfer";
  const isCash = paymentMethodType === "cash";
  const isGateway = paymentMethodType === "gateway";

  const methods = paymentMethods?.methods ?? [];
  const cashMethod = methods.find((m: any) => m?.method === "cash");
  const cashNote = cashMethod?.note ?? "Pay with cash on delivery/pickup.";

  // Build bank details from payment methods response (NOT hardcoded)
  const bankDetails: BankDetails | null = useMemo(() => {
    if (!isBankTransfer) return null;

    const bankTransferMethod = paymentMethods?.methods?.find(
      (m: any) => m?.method === "bank_transfer",
    );

    const details = bankTransferMethod?.bankDetails;
    if (!details) return null;

    return {
      bankName: details.bankName ?? "—",
      accountName: details.accountName ?? "—",
      accountNumber: details.accountNumber ?? "—",
      note:
        details.instructions ??
        `Use order ${
          order?.orderNumber ? `#${order.orderNumber}` : order?.id
        } as payment reference.`,
    };
  }, [isBankTransfer, paymentMethods, order]);

  if (isLoading && !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-1/2 rounded bg-muted" />
          <div className="h-24 w-full rounded-xl bg-muted" />
          <div className="h-48 w-full rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h1 className="text-xl font-semibold">Order</h1>
          <p className="mt-2 text-sm text-destructive">{String(error)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Order ID: {orderId}
          </p>
        </div>
      </div>
    );
  }

  if (!order) return null;
  if (paymentMethodsLoading && isBankTransfer) return <LoadingProgress />;
  if (paymentMethodsIsError && isBankTransfer)
    return (
      <div>
        <p className="text-sm text-destructive">
          Error loading payment methods.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {isPaid ? "Order confirmation" : "Order details"}
          </p>
          <h1 className="mt-2 text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {order?.orderNumber ? `Order #${order.orderNumber}` : "Your order"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Placed{" "}
            {order?.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                  dateStyle: "long",
                })
              : "—"}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize",
            getOrderStatusClasses(status),
          )}
        >
          {orderStatusLabel(status)}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* LEFT: Order info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Items — receipt style */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-baseline justify-between border-b border-border p-5 md:p-6">
              <h2 className="font-heading text-base font-semibold">Items</h2>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="divide-y divide-border">
              {items.map((it: any) => {
                const name = it?.name ?? "Item";
                const qty = Number(it?.quantity ?? 0);
                const lineTotal = it?.lineTotal ?? it?.line_total ?? null;
                const imageUrl = it?.imageUrl ?? it?.image_url ?? null;

                return (
                  <div
                    key={it?.id ?? `${name}-${qty}`}
                    className="flex gap-4 p-5 md:p-6"
                  >
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                          fill
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          No image
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 font-medium">{name}</p>
                        <p className="whitespace-nowrap font-semibold tabular-nums">
                          {lineTotal != null
                            ? formatPriceDisplay(String(lineTotal))
                            : "—"}
                        </p>
                      </div>

                      <div className="mt-1 text-sm text-muted-foreground">
                        Qty {qty}
                        {it?.sku ? (
                          <span className="ml-3">SKU {it.sku}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals — right-aligned, receipt-style summation */}
            <div className="space-y-2 border-t border-border p-5 md:p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {order?.subtotal != null
                    ? formatPriceDisplay(String(order.subtotal))
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {order?.shippingTotal != null
                    ? formatPriceDisplay(String(order.shippingTotal))
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {order?.total != null
                    ? formatPriceDisplay(String(order.total))
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Payment */}
        <div className="space-y-4 lg:col-span-4">
          {isBankTransfer ? (
            <>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
                <p className="font-heading text-base font-semibold">Payment</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Transfer to the bank account below.
                </p>
              </div>

              {bankDetails ? <BankTransferCard details={bankDetails} /> : null}

              {order?.payment?.status === "pending" ? (
                <BankTransferEvidenceSection
                  payment={order?.payment ?? null}
                  onUploaded={async () => {
                    toast.success(
                      "Proof of payment submitted. We’ll verify it shortly.",
                    );
                    qc.invalidateQueries({
                      queryKey: ["storefront-order", orderId],
                    });
                    qc.invalidateQueries({ queryKey: ["payment-methods"] });
                  }}
                />
              ) : null}
            </>
          ) : isCash ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <p className="font-heading text-base font-semibold">Payment</p>
              <div className="mt-3 rounded-lg bg-muted/60 p-3">
                <p className="text-sm">{cashNote}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please have the exact amount ready at pickup/delivery.
                </p>
              </div>
            </div>
          ) : isGateway ? (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    isPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700",
                  )}
                >
                  {isPaid ? (
                    <HiCheckCircle className="h-5 w-5" />
                  ) : (
                    <HiClock className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold">
                    Payment
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {isPaid
                      ? "Your payment was successful."
                      : "We're confirming your payment — this can take a moment."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
              <p className="text-sm">
                Payment method: {String(order?.paymentMethodType ?? "—")}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <HiLockClosed className="h-3.5 w-3.5" />
            <span>Secure order</span>
          </div>
        </div>
      </div>
    </div>
  );
}
