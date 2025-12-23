"use client";

import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { IoIosHeartEmpty } from "react-icons/io";
import Link from "next/link";

import { Button } from "../../../shared/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectWishlistCount } from "@/store/wishlistSlice";
import { CartDrawer } from "../../cart/ui/cart-drawer";
import { AccountDropdown } from "./account-dropdown";

export function HeaderIcons() {
  const wishlistCount = useAppSelector(selectWishlistCount);

  return (
    <div className="flex items-center gap-1">
      {/* Search */}
      <Button
        variant="ghost"
        className="hover:bg-muted size-10"
        aria-label="Search"
      >
        <HiOutlineMagnifyingGlass className="size-6" />
      </Button>

      {/* Account dropdown */}
      <AccountDropdown />

      {/* Wishlist */}
      <Button
        asChild
        variant="ghost"
        className="relative hidden md:flex hover:bg-muted size-10"
        aria-label="Wishlist"
      >
        <Link href="/wishlist">
          <IoIosHeartEmpty className="size-6" />
          {wishlistCount > 0 && (
            <span
              className="
                absolute -right-1 -top-1
                inline-flex min-h-4 min-w-4 items-center justify-center
                rounded-full bg-primary text-[10px] font-semibold text-primary-foreground
              "
            >
              {wishlistCount}
            </span>
          )}
        </Link>
      </Button>

      <CartDrawer />
    </div>
  );
}
