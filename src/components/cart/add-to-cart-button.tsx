"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/cartSlice";

export interface AddToCartButtonProps {
  productId: number | string;
  slug?: string;
  name: string;
  image?: string | null;
  unitPrice: number;
  priceHtml?: string | null;
  quantity?: number;
  attributes?: Record<string, string | null>;
  weightKg?: number; // 👈 NEW
  className?: string;
  size?: "sm" | "lg" | "default";

  onAddedToCart?: () => void;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  image,
  unitPrice,
  priceHtml,
  quantity = 1,
  attributes = {},
  weightKg, // 👈 NEW
  className = "",
  size = "lg",
  onAddedToCart,
  disabled = false,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: productId,
        slug,
        name,
        image: image ?? null,
        unitPrice,
        priceHtml,
        attributes,
        quantity,
        weightKg, // 👈 forward to redux
      })
    );

    if (onAddedToCart) onAddedToCart();
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
