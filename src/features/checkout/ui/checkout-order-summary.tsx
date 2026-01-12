/* eslint-disable @typescript-eslint/no-explicit-any */
// app/checkout/_components/checkout-order-summary.tsx
"use client";

import { cn } from "@/lib/utils";
import { CartItemRow } from "./cart-item-row";

interface CheckoutOrderSummaryProps {
  items: any[]; // or your CartItem type
  formattedSubtotal: string;
  formattedShipping: string | null;
  formattedTotal: string;
  isSummaryOpen: boolean;
  canCalculateShipping: boolean;
  isPickup: boolean; // 👈 NEW
}

export function CheckoutOrderSummary({
  items,
  formattedSubtotal,
  formattedShipping,
  formattedTotal,
  isSummaryOpen,
  canCalculateShipping,
  isPickup,
}: CheckoutOrderSummaryProps) {
  return (
    <aside
      className={cn(
        "w-full md:w-112.5 lg:w-112.5",
        "md:sticky md:top-6 md:self-start"
      )}
    >
      <div
        className={cn(
          "mb-4 rounded-lg border bg-card p-4 md:mb-0 md:block",
          !isSummaryOpen && "hidden md:block"
        )}
      >
        {/* Items list */}
        <div className="md:max-h-100 space-y-3 overflow-y-auto border-b pb-3 text-sm">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={`${item.id}-${JSON.stringify(item.attributes)}`}
                item={item}
              />
            ))
          )}
        </div>

        {/* Cost summary */}
        <div className="mt-3 space-y-2 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formattedSubtotal}</span>
          </div>

          {/* Shipping – hidden completely for pickup */}
          {!isPickup && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              {canCalculateShipping ? (
                formattedShipping ? (
                  <span className="font-medium">{formattedShipping}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Calculating shipping…
                  </span>
                )
              ) : (
                <span className="text-xs text-muted-foreground">
                  Enter shipping address
                </span>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
            <span>
              {isPickup
                ? "Total"
                : canCalculateShipping
                ? "Total"
                : "Total (excl. shipping)"}
            </span>
            <span>{formattedTotal}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
