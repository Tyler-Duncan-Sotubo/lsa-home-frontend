/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/shared/ui/button";
import { addToCartAndSync } from "@/store/cart-sync-thunk";
import { useAppDispatch } from "@/store/hooks";
import { toast } from "sonner";

export interface AddToCartButtonProps {
  slug: string;
  variantId?: string | null;
  quantity?: number;

  // UI fields (Redux only)
  name: string;
  image?: string | null;
  unitPrice: number;
  maxQty?: number | null;

  className?: string;
  size?: "sm" | "lg" | "default";
  onAddedToCart?: () => void;
  disabled?: boolean;
}

export function AddToCartButton({
  slug,
  variantId = null,
  quantity = 1,
  name,
  image = null,
  unitPrice,
  className = "",
  size = "lg",
  onAddedToCart,
  disabled = false,
  maxQty,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    const action = await dispatch(
      addToCartAndSync({
        slug,
        variantId,
        quantity,
        name,
        image,
        unitPrice,
        maxQty,
      }),
    );

    if (addToCartAndSync.rejected.match(action)) {
      const msg =
        (action.payload as any)?.message ??
        action.error?.message ??
        "Unable to add item to cart";

      toast.error(msg);
      return;
    }

    onAddedToCart?.();
    toast.success("Added to cart");
  };

  return (
    <Button
      className={`flex-1 ${className}`}
      size={size}
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
    >
      Add to cart
    </Button>
  );
}
