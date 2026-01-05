/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/quote/ui/add-to-quote-button.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { addToQuote } from "@/store/quoteSlice";

export interface AddToQuoteButtonProps {
  slug: string;
  variantId?: string | null;
  quantity?: number;
  productId?: string | null;
  name: string;
  image?: string | null;

  attributes?: Record<string, any>;
  price?: number | null;

  className?: string;
  size?: "sm" | "lg" | "default";
  onAddedToQuote?: () => void;
  disabled?: boolean;
}

export function AddToQuoteButton({
  productId = null,
  slug,
  variantId = null,
  quantity = 1,
  name,
  image = null,
  attributes,
  price = null,
  className = "",
  size = "lg",
  onAddedToQuote,
  disabled = false,
}: AddToQuoteButtonProps) {
  const dispatch = useAppDispatch();

  const handleAddToQuote = () => {
    dispatch(
      addToQuote({
        slug,
        variantId,
        productId,
        quantity,
        name,
        image,
        attributes,
        price,
      })
    );

    onAddedToQuote?.();
  };

  return (
    <Button
      className={`flex-1 ${className}`}
      size={size}
      type="button"
      onClick={handleAddToQuote}
      disabled={disabled}
    >
      Add to quote
    </Button>
  );
}
