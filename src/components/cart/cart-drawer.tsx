"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartIsOpen,
  updateCartQuantity,
  removeFromCart,
  openCart,
  closeCart,
} from "@/store/cartSlice";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BsCart3 } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const isOpen = useAppSelector(selectCartIsOpen);

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });

  const formattedTotal = currencyFormatter.format(cartTotal);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) dispatch(openCart());
        else dispatch(closeCart());
      }}
    >
      {/* Trigger: cart icon + badge */}
      <Button
        type="button"
        variant={"ghost"}
        className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        aria-label="Cart"
        onClick={() => dispatch(openCart())}
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
        {/* Header (static) */}
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-2xl">Your cart</SheetTitle>
        </SheetHeader>

        {/* Scrollable middle area */}
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
                {items.map((item) => {
                  const lineTotal = item.unitPrice * item.quantity;

                  return (
                    <li
                      key={`${item.id}-${JSON.stringify(
                        item.attributes || {}
                      )}`}
                      className="space-y-2 border-b pb-6"
                    >
                      <section className="flex gap-6">
                        {/* Product image */}
                        <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-muted">
                          {item.slug ? (
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={() => dispatch(closeCart())}
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </Link>
                          ) : item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between text-base">
                          <div>
                            {/* Title */}
                            {item.slug ? (
                              <Link
                                href={`/products/${item.slug}`}
                                className="font-medium hover:underline"
                                onClick={() => dispatch(closeCart())}
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <span className="font-medium">{item.name}</span>
                            )}

                            {/* Options: Color, Size, etc. */}
                            {item.attributes && (
                              <ul className="mt-1 space-y-0.5 text-muted-foreground font-light">
                                {Object.entries(item.attributes).map(
                                  ([key, value]) =>
                                    value && (
                                      <li key={key}>
                                        <span className="capitalize">
                                          {key}:
                                        </span>{" "}
                                        {value}
                                      </li>
                                    )
                                )}
                              </ul>
                            )}

                            {/* Line price (unitPrice * quantity) */}
                            <div className="mt-2 text-base font-semibold">
                              <span>{currencyFormatter.format(lineTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Actions: remove + quantity */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <Button
                          type="button"
                          variant="link"
                          onClick={() =>
                            dispatch(
                              removeFromCart({
                                id: item.id,
                                attributes: item.attributes,
                              })
                            )
                          }
                          className="text-muted-foreground p-0"
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
                              value={item.quantity}
                              onChange={(e) =>
                                dispatch(
                                  updateCartQuantity({
                                    id: item.id,
                                    attributes: item.attributes,
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

              {/* Summary */}
              <div className="flex items-center justify-between text-sm mb-5 mt-10">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xl font-semibold">{formattedTotal}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-base">
                  <span>Shipping</span>
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>

                {/* Taxes row */}
                <div className="flex items-center justify-between text-base">
                  <span>Taxes</span>
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer (static at bottom of drawer) */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <Button className="w-full h-12" size="lg" asChild>
              <Link href="/checkout" onClick={() => dispatch(closeCart())}>
                Checkout
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
