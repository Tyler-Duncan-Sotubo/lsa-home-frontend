"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import Image from "next/image";
import { formatPriceDisplay } from "@/shared/utils/format-naira";
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
    order?.paymentMethodType ?? ""
  ).toLowerCase();
  const isBankTransfer = paymentMethodType === "bank_transfer";

  const isCash = order?.paymentMethodType === "cash";
  const isGateway = order?.paymentMethodType === "gateway";

  const methods = paymentMethods?.methods ?? [];
  const cashMethod = methods.find((m: any) => m?.method === "cash");
  const cashNote = cashMethod?.note ?? "Pay with cash on delivery/pickup.";

  // Build bank details from payment methods response (NOT hardcoded)
  const bankDetails: BankDetails | null = useMemo(() => {
    if (!isBankTransfer) return null;

    const bankTransferMethod = paymentMethods?.methods?.find(
      (m: any) => m?.method === "bank_transfer"
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
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-1/2 bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
          <div className="h-40 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border p-5">
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: Order info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header */}
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

          {/* Items */}
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

        {/* RIGHT: Payment */}
        <div className="col-span-4 space-y-6">
          {isBankTransfer ? (
            <>
              <div>
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
                      "Proof of payment submitted. We’ll verify it shortly."
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
            <div className="mt-2 rounded-lg bg-muted/30 p-3">
              <p className="text-sm">{cashNote}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please have the exact amount ready at pickup/delivery.
              </p>
            </div>
          ) : isGateway ? (
            <div className="mt-2 rounded-lg bg-muted/30 p-3">
              <p className="text-sm">
                {order?.payment?.status === "succeeded"
                  ? "Payment received."
                  : "Payment pending."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                If you haven’t paid yet, return to checkout or use the payment
                link.
              </p>
            </div>
          ) : (
            <div className="mt-2 rounded-lg bg-muted/30 p-3">
              <p className="text-sm">
                Payment method: {String(order?.paymentMethodType ?? "—")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
