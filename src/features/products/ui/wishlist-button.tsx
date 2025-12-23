// src/components/products/wishlist-button.tsx
"use client";

import { Button } from "@/shared/ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import {
  WishlistItem,
  toggleWishlistItem,
  selectIsInWishlist,
} from "@/store/wishlistSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
  size?: string;
}

export function WishlistButton({
  item,
  className = "",
  size = "size-10",
}: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector((state) =>
    selectIsInWishlist(state, item.id)
  );

  const handleToggle = () => {
    dispatch(toggleWishlistItem(item));
  };

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleToggle}
      className={`border-none hover:bg-muted flex items-center justify-center ${size} ${className}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
    >
      {wishlisted ? (
        <FaHeart className="text-primary-foreground size-4 sm:size-6" />
      ) : (
        <FaRegHeart className="size-4 sm:size-6" />
      )}
    </Button>
  );
}
