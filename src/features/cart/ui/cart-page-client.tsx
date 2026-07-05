/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartItems, selectCartTotal } from "@/store/cartSlice";
import { removeItemAndSync, setQtyAndSync } from "@/store/cart-sync-thunk";
import { refreshCartAndHydrate } from "@/store/cart-refresh-thunk";
import { prepareForCheckout } from "@/store/cart-commands";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { HiLockClosed } from "react-icons/hi";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { CartUpsellRail } from "@/features/cart/ui/cart-upsell-rail";
import type { Product } from "@/features/Products/types/products";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function CartPageClient({
  relatedProducts = [],
}: {
  relatedProducts?: Product[];
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);

  useEffect(() => {
    dispatch(refreshCartAndHydrate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }),
    [],
  );

  async function updateQty(item: (typeof items)[number], nextQty: number) {
    const rawMax = typeof item.maxQty === "number" ? Number(item.maxQty) : null;
    const picked = clamp(nextQty, 1, rawMax ?? 999);
    if (picked === item.quantity) return;

    const action = await dispatch(
      setQtyAndSync({
        slug: item.slug,
        variantId: item.variantId ?? null,
        quantity: picked,
      }),
    );

    if (setQtyAndSync.rejected.match(action)) {
      const msg =
        (action.payload as any)?.message ??
        (action.error as any)?.message ??
        "Unable to update quantity";
      toast.error(msg);
    }
  }

  async function removeItem(item: (typeof items)[number]) {
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
      toast.error(msg);
    }
  }

  async function handleCheckout() {
    const action = await dispatch(prepareForCheckout());

    if (prepareForCheckout.rejected.match(action)) {
      const msg =
        (action.payload as any)?.message ??
        (action.error as any)?.message ??
        "Unable to start checkout";
      toast.error(msg);
      return;
    }

    const checkoutId = (action as any).payload?.id;
    if (!checkoutId) return;

    queryClient.removeQueries({ queryKey: ["checkout"] });
    queryClient.removeQueries({ queryKey: ["cart"] });
    router.push(`/checkout/${checkoutId}`);
  }

  const relatedRail = relatedProducts.length > 0 && (
    <CartUpsellRail
      title="You may also like"
      products={relatedProducts}
      className="mt-8"
    />
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto w-[95%] max-w-6xl py-20 md:py-28">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Looks like you haven&apos;t added anything yet — let&apos;s find you
            something good.
          </p>
          <Button asChild className="h-12 px-10 mt-8">
            <Link href="/">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[95%] max-w-7xl py-10">
      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
        Shopping cart
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
        Your cart
      </h1>

      <div className="flex flex-col gap-10 mt-8 md:flex-row md:items-start md:gap-14">
        <section className="flex-1">
          <ul className="divide-y">
            {items.map((item) => {
              const lineTotal =
                Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0);

              const rawMax =
                typeof item.maxQty === "number" ? Number(item.maxQty) : null;
              const isUnknownStock = rawMax == null;
              const isOutOfStock = rawMax != null && rawMax <= 0;

              const currentQty = Number(item.quantity ?? 1);
              const safeQty =
                rawMax == null
                  ? currentQty
                  : clamp(currentQty, 1, Math.max(1, rawMax));

              return (
                <li
                  key={`${item.slug}__${item.variantId ?? ""}`}
                  className="flex gap-5 py-7 first:pt-0 md:gap-8"
                >
                  <div className="relative overflow-hidden rounded-lg h-28 w-28 shrink-0 bg-muted md:h-36 md:w-36">
                    <Link href={`/products/${item.slug}`}>
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

                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium hover:underline"
                        >
                          {item.name ?? item.slug}
                        </Link>

                        {item.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}

                        {item.attributes && (
                          <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
                            {Object.entries(item.attributes)
                              .filter(([, v]) => v)
                              .map(([k, v]) => (
                                <span key={k}>
                                  <span className="capitalize">{k}:</span> {v}
                                </span>
                              ))}
                          </div>
                        )}

                        {item.bundleSelections &&
                          item.bundleSelections.length > 0 && (
                            <ul className="mt-2 flex flex-col gap-1 border-l pl-3 text-xs text-muted-foreground">
                              {item.bundleSelections.map((sel) => (
                                <li key={sel.componentProductId}>
                                  <span className="font-medium text-foreground">
                                    {sel.componentName ?? "Item"}
                                  </span>
                                  {sel.attributes &&
                                    Object.values(sel.attributes).some(
                                      Boolean,
                                    ) && (
                                      <span>
                                        {" — "}
                                        {Object.values(sel.attributes)
                                          .filter(Boolean)
                                          .join(" / ")}
                                      </span>
                                    )}
                                </li>
                              ))}
                            </ul>
                          )}

                        {isOutOfStock ? (
                          <p className="mt-2 text-xs text-destructive">
                            Out of stock
                          </p>
                        ) : !isUnknownStock && rawMax! <= 10 ? (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Only {rawMax} left
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item)}
                        className="transition text-muted-foreground hover:text-foreground"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4">
                      <div className="inline-flex items-center border rounded-full">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={isOutOfStock || safeQty <= 1}
                          onClick={() => updateQty(item, safeQty - 1)}
                          className="flex items-center justify-center transition rounded-full h-9 w-9 hover:bg-muted disabled:opacity-40"
                        >
                          <FiMinus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-sm font-medium text-center tabular-nums">
                          {safeQty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={
                            isOutOfStock ||
                            (!isUnknownStock && safeQty >= (rawMax ?? 0))
                          }
                          onClick={() => updateQty(item, safeQty + 1)}
                          className="flex items-center justify-center transition rounded-full h-9 w-9 hover:bg-muted disabled:opacity-40"
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-base font-semibold">
                        {currencyFormatter.format(lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {relatedRail}
        </section>

        <aside className="w-full shrink-0 md:w-96">
          <div className="p-6 border shadow-sm rounded-xl bg-card md:p-7">
            <h2 className="text-base font-semibold">Order summary</h2>

            <div className="mt-5 space-y-2.5 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-xl font-semibold">
                  {currencyFormatter.format(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-xs text-muted-foreground">
                  Calculated at checkout
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span className="text-xs text-muted-foreground">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 mt-5"
              size="lg"
              onClick={handleCheckout}
            >
              Continue to checkout
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <HiLockClosed className="h-3.5 w-3.5" />
              <span>Secure checkout</span>
            </div>

            {!isAuthenticated && (
              <div className="mt-5 flex items-center justify-center gap-1.5 border-t pt-4 text-sm">
                <span className="text-muted-foreground">Have an account?</span>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/login">Sign in</Link>
                </Button>
                <span className="text-muted-foreground">or</span>
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href="/register">sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
