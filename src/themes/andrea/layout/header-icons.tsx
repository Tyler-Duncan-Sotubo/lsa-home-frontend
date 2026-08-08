"use client";

import { IoIosHeart } from "react-icons/io";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectWishlistCount } from "@/store/wishlistSlice";
import { CartDrawer } from "@/features/cart/ui/cart-drawer";
import { AccountDropdown } from "@/themes/modave/layout/Header/ui/account-dropdown";

// andrea's own header icons — solid wishlist icon instead of outline.
// Account and cart are reused as-is (AccountDropdown/CartDrawer are
// theme-agnostic feature components with real auth/checkout logic, not
// worth forking just to swap a glyph).
type Props = {
  icons?: {
    account?: boolean;
    wishlist?: boolean;
    cart?: boolean;
    quote?: boolean;
  };
};

export function HeaderIcons({ icons }: Props) {
  const wishlistCount = useAppSelector(selectWishlistCount);

  const showAccount = icons?.account ?? true;
  const showWishlist = icons?.wishlist === true && wishlistCount > 0;
  const showCart = icons?.cart === true;

  return (
    <div className="flex items-center gap-1">
      {showAccount && <AccountDropdown />}

      {showWishlist && (
        <Button
          asChild
          variant="ghost"
          className="relative hidden md:flex hover:bg-muted size-10"
          aria-label="Wishlist"
        >
          <Link href="/wishlist">
            <IoIosHeart className="size-6 text-primary" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
        </Button>
      )}

      {showCart && <CartDrawer />}
    </div>
  );
}
