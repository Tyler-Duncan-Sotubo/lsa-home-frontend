"use client";

import Link from "next/link";
import Image from "next/image";
import { HiLockClosed } from "react-icons/hi";
import { BsCart3 } from "react-icons/bs";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { useAppSelector } from "@/store/hooks";
import { selectCartCount } from "@/store/cartSlice";

export function CheckoutHeader({ config }: { config: StorefrontConfigV1 }) {
  const logoUrl = config?.theme?.assets?.logoUrl;
  const storeName = config?.store?.name ?? "";
  const cartCount = useAppSelector(selectCartCount);

  return (
    <header className="border-b">
      <div className="mx-auto flex w-[95%] max-w-6xl items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={storeName}
              width={110}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          ) : (
            <span className="text-lg font-semibold">{storeName}</span>
          )}
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <HiLockClosed className="h-3.5 w-3.5" />
            <span>Secure checkout</span>
          </div>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-muted"
          >
            <BsCart3 className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
