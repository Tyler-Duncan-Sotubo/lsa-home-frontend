"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LuUserRound,
  LuUserPlus,
  LuLogIn,
  LuGift,
  LuHeart,
  LuStore,
  LuLogOut,
} from "react-icons/lu";

import { Button } from "../../../shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";

export function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const navRules = useAppSelector((s) => s.runtimeConfig.ui.account.headerNav);

  const isLoggedIn = !!session;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="md:flex hover:bg-muted size-10"
          aria-label="Account"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <LuUserRound className="size-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 py-3 space-y-1"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {isLoggedIn ? (
          <>
            <DropdownMenuLabel>Welcome Back!</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center gap-2">
                <LuUserRound className="size-4" />
                My Account
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => signOut()}>
              <div className="flex items-center gap-2">
                <LuLogOut className="size-4" />
                Sign out
              </div>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/register" className="flex items-center gap-2">
                <LuUserPlus className="size-4" />
                Create account
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center gap-2">
                <LuLogIn className="size-4" />
                Sign in
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {navRules.showRewardIcon && (
          <DropdownMenuItem asChild>
            <Link href="/rewards" className="flex items-center gap-2">
              <LuGift className="size-4" />
              My rewards
            </Link>
          </DropdownMenuItem>
        )}

        {navRules.showWishlistIcon && (
          <DropdownMenuItem asChild>
            <Link href="/wishlist" className="flex items-center gap-2">
              <LuHeart className="size-4" />
              Wishlist
            </Link>
          </DropdownMenuItem>
        )}

        {navRules.showOurStoresIcon && (
          <DropdownMenuItem asChild>
            <Link href="/stores" className="flex items-center gap-2">
              <LuStore className="size-4" />
              Our stores
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
