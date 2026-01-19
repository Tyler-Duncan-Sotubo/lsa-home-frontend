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
import { usePathname, useRouter } from "next/navigation";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useAppSelector(selectCartIsOpen);
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const queryClient = useQueryClient();

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum: number, it: any) =>
        sum + Number(it.unitPrice ?? 0) * Number(it.quantity ?? 0),
      0,
    );
  }, [items]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }),
    [],
  );

  const checkoutId = useMemo(() => {
    const m = pathname?.match(/^\/checkout\/([^/]+)$/);
    return m?.[1] ?? null;
  }, [pathname]);

  function useSyncCheckout() {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: async (checkoutId: string) => {
        const { data } = await axios.post(`/api/checkout/${checkoutId}/sync`);
        return data;
      },
      onSuccess: (updatedCheckout, checkoutId) => {
        qc.setQueryData(["checkout", checkoutId], updatedCheckout);
      },
    });
  }

  const syncCheckoutMutation = useSyncCheckout();

  const refreshCheckoutIfOnCheckout = async () => {
    if (!checkoutId) return;
    await syncCheckoutMutation.mutateAsync(checkoutId);
  };

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
        onClick={() => {
          dispatch(openCart());
          dispatch(refreshCartAndHydrate());
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
                <Button variant={"clean"} className="w-96 my-6">
                  Go to Homepage
                </Button>
              </Link>
              <Button variant={"clean"} className="w-96">
                Shop Best Sellers
              </Button>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item: any) => {
                  const lineTotal =
                    Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);

                  // ✅ NO FALLBACKS: stock must exist to allow changing qty
                  const rawMax =
                    typeof item.maxQty === "number"
                      ? Number(item.maxQty)
                      : null;

                  const isUnknownStock = rawMax == null;
                  const isOutOfStock = rawMax != null && rawMax <= 0;

                  // only allow selecting up to min(rawMax, 10)
                  const qtyOptions =
                    rawMax != null ? Math.max(0, Math.min(10, rawMax)) : 0;

                  // clamp displayed qty when stock is known
                  const currentQty = Number(item.quantity ?? 1);
                  const safeQty =
                    rawMax == null
                      ? currentQty
                      : clamp(currentQty, 1, Math.max(1, rawMax));

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

                            {isOutOfStock ? (
                              <p className="mt-2 text-xs text-destructive">
                                Out of stock
                              </p>
                            ) : !isUnknownStock && rawMax! <= 10 ? (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                Only {rawMax} left
                              </p>
                            ) : isUnknownStock ? (
                              <p className="mt-2 text-[11px] text-muted-foreground">
                                Stock unavailable for this item (refresh cart).
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </section>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <Button
                          type="button"
                          variant="link"
                          className="text-muted-foreground p-0"
                          onClick={async () => {
                            const action = await dispatch(
                              removeItemAndSync({
                                slug: item.slug,
                                variantId: item.variantId ?? null,
                              }),
                            );

                            if (removeItemAndSync.rejected.match(action)) {
                              const msg =
                                (action.payload as any)?.message ??
                                (action.error as any)?.message ??
                                "Unable to remove item";
                              console.log("removeItemAndSync failed:", action);
                              toast.error(msg);
                              return;
                            }

                            await refreshCheckoutIfOnCheckout();
                          }}
                        >
                          Remove
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Qty:
                          </span>

                          {isUnknownStock ? (
                            // ✅ unknown stock => no selector (prevents random 10/1)
                            <div className="h-8 rounded-md border bg-background px-2 flex items-center text-xs font-medium">
                              {safeQty}
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                className="
    h-8 rounded-md border bg-background px-2 pr-6
    text-xs font-medium
  "
                                value={safeQty}
                                disabled={isOutOfStock || qtyOptions <= 0}
                                onChange={async (e) => {
                                  const picked = Number(e.target.value) || 1;
                                  const nextQty = clamp(
                                    picked,
                                    1,
                                    Math.max(1, rawMax!),
                                  );

                                  // 🛑 no-op guard (prevents useless API + toast)
                                  if (nextQty === item.quantity) return;

                                  const action = await dispatch(
                                    setQtyAndSync({
                                      slug: item.slug,
                                      variantId: item.variantId ?? null,
                                      quantity: nextQty,
                                    }),
                                  );

                                  // ❌ error toast
                                  if (setQtyAndSync.rejected.match(action)) {
                                    const msg =
                                      (action.payload as any)?.message ??
                                      (action.error as any)?.message ??
                                      "Unable to update quantity";

                                    toast.error(msg);
                                    return;
                                  }

                                  // ✅ success toast
                                  toast.success(
                                    nextQty === 1
                                      ? "Quantity updated"
                                      : `Quantity updated to ${nextQty}`,
                                  );

                                  await refreshCheckoutIfOnCheckout();
                                }}
                              >
                                {Array.from({ length: qtyOptions }).map(
                                  (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                          )}
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

                  if (prepareForCheckout.rejected.match(action)) {
                    const msg =
                      (action.payload as any)?.message ??
                      (action.error as any)?.message ??
                      "Unable to start checkout";
                    console.log("prepareForCheckout failed:", action);
                    toast.error(msg);
                    return;
                  }

                  const checkoutId = (action as any).payload?.id;
                  if (!checkoutId) return;

                  dispatch(closeCart());
                  queryClient.removeQueries({ queryKey: ["checkout"] });
                  queryClient.removeQueries({ queryKey: ["cart"] });
                  router.push(`/checkout/${checkoutId}`);
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
