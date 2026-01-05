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
import { toast } from "sonner";

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

    if (wishlisted) {
      toast.info("Removed from wishlist");
    } else {
      toast.success("Added to wishlist");
    }
  };

  return (
    <Button
      variant="clean"
      type="button"
      onClick={handleToggle}
      className={`border-none flex items-center justify-center hover:bg-transparent p-0 ${size} ${className}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
    >
      {wishlisted ? (
        <FaHeart className="text-primary size-4 sm:size-6" />
      ) : (
        <FaRegHeart className="size-4 sm:size-6 text-primary" />
      )}
    </Button>
  );
}
