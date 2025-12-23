"use client";

import { Button } from "@/shared/ui/button";
import { addToCartAndSync } from "@/store/cart-sync-thunk";
import { useAppDispatch } from "@/store/hooks";

export interface AddToCartButtonProps {
  slug: string;
  variantId?: string | null;
  quantity?: number;

  // UI fields (Redux only)
  name: string;
  image?: string | null;
  unitPrice: number;

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
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCartAndSync({
        slug,
        variantId,
        quantity,
        name,
        image,
        unitPrice,
      })
    );

    onAddedToCart?.();
  };

  return (
    <Button
      className={`flex-1 bg-primary-foreground text-white ${className}`}
      size={size}
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
    >
      Add to cart
    </Button>
  );
}
