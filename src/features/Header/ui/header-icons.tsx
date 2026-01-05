"use client";

import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoIosHeartEmpty } from "react-icons/io";
import { FiFileText } from "react-icons/fi";
import Link from "next/link";

import { Button } from "../../../shared/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectWishlistCount } from "@/store/wishlistSlice";
import { CartDrawer } from "../../cart/ui/cart-drawer";
import { AccountDropdown } from "./account-dropdown";

import { openQuote, selectQuoteCount } from "@/store/quoteSlice";

type Props = {
  icons?: {
    search?: boolean;
    account?: boolean;
    wishlist?: boolean;
    cart?: boolean;
    quote?: boolean;
  };
  onSearchClick?: () => void; // ✅ add
};

export function HeaderIcons({ icons, onSearchClick }: Props) {
  const dispatch = useAppDispatch();

  const wishlistCount = useAppSelector(selectWishlistCount);
  const quoteCount = useAppSelector(selectQuoteCount);

  const showSearch = icons?.search ?? true;
  const showAccount = icons?.account ?? true;
  const showWishlist = icons?.wishlist ?? true;
  const showCart = icons?.cart ?? true;
  const showQuote = icons?.quote ?? true;

  return (
    <div className="flex items-center gap-1">
      {showSearch && (
        <Button
          variant="ghost"
          className="hover:bg-muted size-10"
          aria-label="Search"
          onClick={onSearchClick}
        >
          <HiOutlineMagnifyingGlass className="size-6" />
        </Button>
      )}

      {showAccount && <AccountDropdown />}

      {showWishlist && (
        <Button
          asChild
          variant="ghost"
          className="relative hidden md:flex hover:bg-muted size-10"
          aria-label="Wishlist"
        >
          <Link href="/wishlist">
            <IoIosHeartEmpty className="size-6" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {wishlistCount}
              </span>
            )}
          </Link>
        </Button>
      )}

      {showQuote && (
        <Button
          variant="ghost"
          className="relative hover:bg-muted size-10"
          aria-label="Quote"
          type="button"
          onClick={() => dispatch(openQuote())}
        >
          <FiFileText className="size-6" />
          {quoteCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {quoteCount}
            </span>
          )}
        </Button>
      )}

      {showCart && <CartDrawer />}
    </div>
  );
}
