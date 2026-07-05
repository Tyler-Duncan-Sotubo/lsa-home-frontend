"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import Image from "next/image";
import { HiLockClosed } from "react-icons/hi";
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
import { OrderPaystackVerifier } from "./order-paystack-verifier";

type Props = {
  orderId: string;
};

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

  // Determine if this order is bank transfer
  const paymentMethodType = String(
    order?.paymentMethodType ?? "",
  ).toLowerCase();
  const isBankTransfer = paymentMethodType === "bank_transfer";

  const isCash = order?.paymentMethodType === "cash";
  const isGateway =
    String(order?.paymentMethodType ?? "").toLowerCase() === "gateway";

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
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Order confirmation
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
        {order?.orderNumber ? `Order #${order.orderNumber}` : "Your order"}
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* LEFT: Order info */}
        <div className="space-y-6 lg:col-span-8">
          {/* Header */}
          <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-medium">
                  Placed{" "}
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                        dateStyle: "medium",
                      })
                    : ""}
                </p>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  getOrderStatusClasses(order?.status ?? ""),
                )}
              >
                {orderStatusLabel(order?.status ?? "")}
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Subtotal</p>
                <p className="mt-1 font-semibold">
                  {order?.subtotal != null
                    ? formatPriceDisplay(String(order.subtotal))
                    : "—"}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Shipping</p>
                <p className="mt-1 font-semibold">
                  {order?.shippingTotal != null
                    ? formatPriceDisplay(String(order.shippingTotal))
                    : "—"}
                </p>
              </div>

              <div className="col-span-2 rounded-lg bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="mt-1 text-lg font-semibold">
                  {order?.total != null
                    ? formatPriceDisplay(String(order.total))
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-5 md:p-6">
              <h2 className="text-base font-semibold">Items</h2>
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
                    className="flex gap-4 p-5 md:p-6"
                  >
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
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
                        <p className="whitespace-nowrap font-semibold">
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

        {/* RIGHT: Payment */}
        <div className="space-y-4 lg:col-span-4">
          {isBankTransfer ? (
            <>
              <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
                <p className="text-base font-semibold">Payment</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Transfer to the bank account below.
                </p>
              </div>

              {bankDetails ? <BankTransferCard details={bankDetails} /> : null}

              {/* evidence upload only if pending & no evidence */}
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
            <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
              <p className="text-base font-semibold">Payment</p>
              <div className="mt-3 rounded-lg bg-muted/40 p-3">
                <p className="text-sm">{cashNote}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Please have the exact amount ready at pickup/delivery.
                </p>
              </div>
            </div>
          ) : isGateway ? (
            <OrderPaystackVerifier orderId={orderId} />
          ) : (
            <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
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
