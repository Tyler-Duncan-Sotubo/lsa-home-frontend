/* eslint-disable @typescript-eslint/no-explicit-any */
// app/checkout/_components/checkout-order-summary.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CartItemRow } from "./cart-item-row";
import { CartUpsellRail } from "@/features/cart/ui/cart-upsell-rail";
import type { Product } from "@/features/Products/types/products";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

interface CheckoutOrderSummaryProps {
  items: any[]; // or your CartItem type
  formattedSubtotal: string;
  formattedShipping: string | null;
  formattedDiscount?: string | null;
  formattedTotal: string;
  isSummaryOpen: boolean;
  canCalculateShipping: boolean;
  isPickup: boolean; // 👈 NEW
  relatedProducts?: Product[];
  appliedDiscountCodeId?: string | null;
  onApplyDiscountCode?: (code: string) => Promise<any>;
  isApplyingDiscountCode?: boolean;
  onRemoveDiscountCode?: () => Promise<any>;
  isRemovingDiscountCode?: boolean;
}

export function CheckoutOrderSummary({
  items,
  formattedSubtotal,
  formattedShipping,
  formattedDiscount,
  formattedTotal,
  isSummaryOpen,
  canCalculateShipping,
  isPickup,
  relatedProducts = [],
  appliedDiscountCodeId,
  onApplyDiscountCode,
  isApplyingDiscountCode,
  onRemoveDiscountCode,
  isRemovingDiscountCode,
}: CheckoutOrderSummaryProps) {
  const [codeInput, setCodeInput] = useState("");

  const handleApply = async () => {
    if (!codeInput.trim() || !onApplyDiscountCode) return;
    try {
      await onApplyDiscountCode(codeInput.trim());
      setCodeInput("");
      toast.success("Discount code applied");
    } catch (e: any) {
      toast.error(e?.error?.message ?? e?.message ?? "Invalid discount code");
    }
  };

  const handleRemove = async () => {
    if (!onRemoveDiscountCode) return;
    try {
      await onRemoveDiscountCode();
    } catch (e: any) {
      toast.error(e?.error?.message ?? e?.message ?? "Failed to remove code");
    }
  };
  return (
    <aside
      className={cn(
        "w-full md:w-112.5 lg:w-112.5",
        "md:sticky md:top-6 md:self-start",
      )}
    >
      <div
        className={cn(
          "mb-4 rounded-xl border bg-card p-4 shadow-sm md:mb-0 md:block md:p-6",
          !isSummaryOpen && "hidden md:block",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Order summary</h2>
          {items.length > 0 &&
            (() => {
              const itemCount = items.reduce(
                (sum, it) => sum + Number(it.quantity ?? 0),
                0,
              );
              return (
                <span className="text-xs text-muted-foreground">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </span>
              );
            })()}
        </div>

        {/* Items list */}
        <div className="pb-3 space-y-3 overflow-y-auto text-sm border-b md:max-h-100">
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

        {/* Discount code */}
        {(onApplyDiscountCode || onRemoveDiscountCode) && (
          <div className="pb-3 mt-3 border-b">
            {appliedDiscountCodeId ? (
              <div className="flex items-center justify-between px-3 py-2 text-sm rounded-md bg-emerald-50 dark:bg-emerald-950">
                <span className="text-emerald-700 dark:text-emerald-400">
                  Discount code applied
                </span>
                <button
                  type="button"
                  className="text-xs underline underline-offset-2 text-muted-foreground"
                  onClick={handleRemove}
                  disabled={isRemovingDiscountCode}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  className="flex-1 h-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApply();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="clean"
                  size="sm"
                  className="h-10"
                  onClick={handleApply}
                  disabled={!codeInput.trim() || isApplyingDiscountCode}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cost summary */}
        <div className="mt-3 space-y-2 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formattedSubtotal}</span>
          </div>

          {/* Discount */}
          {formattedDiscount && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                -{formattedDiscount}
              </span>
            </div>
          )}

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
          <div className="flex items-center justify-between pt-2 text-base font-semibold border-t">
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

        {relatedProducts.length > 0 && (
          <div className="pt-4 mt-5 border-t">
            <CartUpsellRail
              title="You may also like"
              products={relatedProducts}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
