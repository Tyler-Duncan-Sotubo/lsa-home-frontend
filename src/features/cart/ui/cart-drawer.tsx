/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { BsCart3 } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeCart,
  openCart,
  selectCartCount,
  selectCartIsOpen,
  selectCartItems,
} from "@/store/cartSlice";
import { removeItemAndSync, setQtyAndSync } from "@/store/cart-sync-thunk";
import { refreshCartAndHydrate } from "@/store/cart-refresh-thunk";
import { prepareForCheckout } from "@/store/cart-commands";
import { useQueryClient } from "@tanstack/react-query";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector(selectCartIsOpen);
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const queryClient = useQueryClient();

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.unitPrice ?? 0) * Number(it.quantity ?? 0),
      0
    );
  }, [items]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }),
    []
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => dispatch(open ? openCart() : closeCart())}
    >
      <Button
        type="button"
        variant={"ghost"}
        className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Cart"
        onClick={(open) => {
          dispatch(open ? openCart() : closeCart());
          if (open) dispatch(refreshCartAndHydrate());
        }}
      >
        <BsCart3 className="size-6" />
        {cartCount > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              inline-flex min-h-4 min-w-4 items-center justify-center
              rounded-full bg-primary text-[10px] font-semibold text-primary-foreground
            "
          >
            {cartCount}
          </span>
        )}
      </Button>

      <SheetContent
        className="
          flex h-full max-h-screen flex-col w-full
          sm:max-w-xl md:max-w-xl lg:max-w-xl
          p-0
        "
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl">Your cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground mt-20">
              <h3 className="text-3xl font-semibold">Your cart is empty.</h3>
              <Link href="/" onClick={() => dispatch(closeCart())}>
                <Button variant={"outline"} className="w-96 my-6">
                  Go to Homepage
                </Button>
              </Link>
              <Button variant={"outline"} className="w-96">
                Shop Best Sellers
              </Button>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item: any) => {
                  const lineTotal =
                    Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);

                  return (
                    <li
                      key={`${item.slug}__${item.variantId ?? ""}`}
                      className="space-y-2 border-b pb-6"
                    >
                      <section className="flex gap-6">
                        <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-muted">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => dispatch(closeCart())}
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name ?? item.slug}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No image
                              </div>
                            )}
                          </Link>
                        </div>

                        <div className="flex flex-1 flex-col justify-between text-base">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              className="font-medium hover:underline"
                              onClick={() => dispatch(closeCart())}
                            >
                              {item.name ?? item.slug}
                            </Link>

                            <div className="mt-2 text-base font-semibold">
                              <span>{currencyFormatter.format(lineTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <Button
                          type="button"
                          variant="link"
                          className="text-muted-foreground p-0"
                          onClick={() =>
                            dispatch(
                              removeItemAndSync({
                                slug: item.slug,
                                variantId: item.variantId ?? null,
                              })
                            )
                          }
                        >
                          Remove
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Qty:
                          </span>
                          <div className="relative">
                            <select
                              className="
                                h-8 rounded-md border bg-background px-2 pr-6
                                text-xs font-medium
                              "
                              value={Number(item.quantity ?? 1)}
                              onChange={(e) =>
                                dispatch(
                                  setQtyAndSync({
                                    slug: item.slug,
                                    variantId: item.variantId ?? null,
                                    quantity: Number(e.target.value) || 1,
                                  })
                                )
                              }
                            >
                              {Array.from({ length: 10 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between text-sm mb-5 mt-10">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xl font-semibold">
                  {currencyFormatter.format(subtotal)}
                </span>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <Button className="w-full h-12" size="lg" asChild>
              <Link
                href="/checkout"
                onClick={async (e) => {
                  e.preventDefault();
                  const action = await dispatch(prepareForCheckout());
                  if (prepareForCheckout.fulfilled.match(action)) {
                    const checkoutId = action.payload?.id;
                    if (checkoutId) {
                      dispatch(closeCart());
                      const qc = queryClient;
                      qc.removeQueries({ queryKey: ["checkout"] });
                      qc.removeQueries({ queryKey: ["cart"] });
                      router.push(`/checkout/${checkoutId}`);
                    }
                  }
                }}
              >
                Checkout
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
