/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/quote/ui/quote-sheet.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  closeQuote,
  nextStep,
  prevStep,
  removeFromQuote,
  selectQuoteCustomer,
  selectQuoteIsOpen,
  selectQuoteItems,
  selectQuoteStep,
  setCustomerEmail,
  setCustomerNote,
  updateQuoteQuantity,
  clearQuote,
} from "@/store/quoteSlice";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useSession } from "next-auth/react";
import { useSubmitQuote } from "../hooks/use-submit-quote";
import { toast } from "sonner";
import { useCanSeePrice } from "@/shared/hooks/use-can-see-price";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import Link from "next/link";
import { useLinkedProductsQuery } from "@/features/Products/hooks/use-upsell-products";
import { LinkedProducts } from "@/features/Products/ui/ProductInfo/linked-products";
import { LINK_COPY } from "@/shared/constants/link-copy";

function StepPill({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className="px-4 py-1 text-xs font-medium transition-colors"
    >
      {children}
    </Badge>
  );
}

function QuoteSheetFooter({
  step,
  canContinue,
  canSubmit,
  onBack,
  onContinue,
  onSubmit,
  onContinueShopping,
  isSubmitting,
}: {
  step: number;
  canContinue: boolean;
  canSubmit: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSubmit: () => void;
  onContinueShopping?: () => void;
  subtotalLabel: number | string | null;
  hasAnyPrice: boolean;
  hasMissingPrice: boolean;
  isSubmitting: boolean;
}) {
  const effectiveStep = step === 2 ? 2 : 1;

  return (
    <div className="sticky bottom-0 z-20 border-t bg-white px-4 py-3 backdrop-blur supports-backdrop-filter:bg-white">
      <div className="flex items-center justify-between gap-3">
        {effectiveStep === 1 ? (
          <div className="flex items-center gap-2">
            <Button variant="clean" onClick={onContinueShopping}>
              Continue Shopping
            </Button>
            <Button onClick={onContinue} disabled={!canContinue}>
              Continue
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
            >
              Submit request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const normalizeNumber = (value: string) => value.replace(/[₦,\s]/g, "").trim();

export function parsePrice(
  value: number | string | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const num = Number(normalizeNumber(value));
  return Number.isFinite(num) ? num : null;
}

export function lineTotal(
  price: number | string | null | undefined,
  qty: number,
): number | null {
  const p = parsePrice(price);
  if (p == null) return null;
  const q = Number.isFinite(qty) && qty > 0 ? qty : 0;
  return p * q;
}

export function QuoteSheet() {
  const { data: session } = useSession();
  const submitQuote = useSubmitQuote();
  const user = session?.user.email || "";
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectQuoteIsOpen);
  const step = useAppSelector(selectQuoteStep);
  const items = useAppSelector(selectQuoteItems);
  const customer = useAppSelector(selectQuoteCustomer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { canSee, rule, isLoggedIn, priceRange } = useCanSeePrice();
  const formatPrice = usePriceDisplay();

  const email = customer.email.trim();
  const canSubmit = items.length > 0 && email.length > 3 && email.includes("@");

  const progress = step === 1 ? 50 : 100;

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    const emailToUse = (customer.email || user || "").trim();

    if (!emailToUse || emailToUse.length < 4 || !emailToUse.includes("@")) {
      setSubmitError("Please enter a valid email.");
      setIsSubmitting(false);
      return;
    }

    if (!items.length) {
      setSubmitError("Please add at least one item.");
      setIsSubmitting(false);
      return;
    }

    submitQuote.mutate(
      {
        customerEmail: emailToUse,
        customerNote: customer.note ?? undefined,
        items: items.map((it) => ({
          productId: (it as any).productId ?? undefined,
          variantId: it.variantId ?? undefined,
          name: it.name,
          variantLabel: (it as any).variantLabel ?? undefined,
          attributes: it.attributes ?? undefined,
          imageUrl: it.image ?? null,
          quantity: it.quantity,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Quote request submitted successfully!", {
            className: "bg-green-600 text-white",
          });
          dispatch(clearQuote());
          dispatch(closeQuote());
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unable to submit quote";
          setSubmitError(message);
          setIsSubmitting(false);
        },
      },
    );
  };

  const { subtotal, hasAnyPrice, hasMissingPrice } = useMemo(() => {
    let sum = 0;
    let any = false;
    let missing = false;

    for (const it of items) {
      const p = parsePrice(it.price);
      if (p == null) {
        missing = true;
        continue;
      }
      any = true;
      sum += p * (it.quantity ?? 0);
    }

    if (!canSee) {
      return { subtotal: null, hasAnyPrice: false, hasMissingPrice: false };
    }

    return {
      subtotal: any ? sum : null,
      hasAnyPrice: any,
      hasMissingPrice: missing,
    };
  }, [items, canSee]);

  const formattedSubtotal =
    subtotal != null ? formatPrice(String(subtotal)) : null;

  const baseProductId = (items?.[0] as any)?.productId
    ? String((items[0] as any).productId)
    : null;

  const { data: upsells = [], isLoading: upsellsLoading } =
    useLinkedProductsQuery(baseProductId, "upsell", open);
  const copy = LINK_COPY["upsell"];

  return (
    <Sheet open={open} onOpenChange={() => dispatch(closeQuote())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-150 p-0 flex h-dvh flex-col"
      >
        <SheetHeader className="border-b px-4 py-10">
          <SheetTitle className="text-base font-semibold leading-none">
            Request a Quote
          </SheetTitle>

          <div className="my-4 flex items-center gap-2">
            <StepPill active={step === 1}>Step 1 · Items</StepPill>
            <StepPill active={step === 2}>Step 2 · Details</StepPill>
          </div>

          <Progress value={progress} className="h-2" />
        </SheetHeader>

        <div className="flex flex-1 flex-col min-h-0">
          {step === 1 ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Your items</p>
                  <p className="text-xs text-muted-foreground">
                    Review products and set quantities.
                  </p>
                </div>

                <Button
                  variant="clean"
                  size="sm"
                  onClick={() => dispatch(clearQuote())}
                  disabled={items.length === 0}
                >
                  Clear
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((it) => {
                  const minQty = Math.max(1, it.moq ?? 1);
                  const safeQty = Math.max(minQty, it.quantity ?? minQty);

                  return (
                    <div
                      key={`${it.slug}__${it.variantId ?? ""}`}
                      className="group flex items-center gap-3 transition"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={it.image ?? "/placeholder.png"}
                          alt={it.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {it.name}
                        </p>

                        {it.variantLabel ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {it.variantLabel}
                          </p>
                        ) : null}

                        {canSee && parsePrice(it.price) != null ? (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-sm font-semibold text-foreground">
                              {priceRange ? "From " : ""}
                              {formatPrice(String(it.price))}{" "}
                              {priceRange ? "per unit " : ""}
                            </p>

                            {/* {safeQty > 1 ? (
                              <p className="text-xs text-muted-foreground font-semibold">
                                {safeQty} × {priceRange ? "From " : ""}
                                {formatPrice(String(it.price))} ={" "}
                                {formatPrice(
                                  String(lineTotal(it.price, safeQty) ?? ""),
                                )}
                              </p>
                            ) : null} */}
                          </div>
                        ) : (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Price will be confirmed in your quote.
                            </p>

                            {rule === "loggedInOnly" && !isLoggedIn ? (
                              <p className="text-[11px] text-muted-foreground">
                                <Link
                                  href="/account/login"
                                  className="underline font-medium"
                                >
                                  Sign in
                                </Link>{" "}
                                to view pricing.
                              </p>
                            ) : null}
                          </div>
                        )}

                        {minQty > 1 ? (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Minimum order: {minQty}
                          </p>
                        ) : null}
                      </div>

                      <input
                        type="number"
                        inputMode="numeric"
                        className="h-9 w-20 rounded-md bg-background px-2 text-xs shadow-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-primary/40"
                        min={minQty}
                        step={1}
                        value={safeQty}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const next = Number(raw);
                          if (raw === "" || Number.isNaN(next)) return;

                          dispatch(
                            updateQuoteQuantity({
                              slug: it.slug,
                              variantId: it.variantId ?? null,
                              quantity: next,
                            }),
                          );
                        }}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          const clamped = Number.isFinite(next)
                            ? Math.max(minQty, next)
                            : minQty;

                          if ((it.quantity ?? minQty) !== clamped) {
                            dispatch(
                              updateQuoteQuantity({
                                slug: it.slug,
                                variantId: it.variantId ?? null,
                                quantity: clamped,
                              }),
                            );
                          }
                        }}
                        aria-label={`Quantity for ${it.name}`}
                      />

                      <Button
                        variant="link"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          dispatch(
                            removeFromQuote({
                              slug: it.slug,
                              variantId: it.variantId ?? null,
                            }),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}

                {items.length === 0 ? (
                  <div className="rounded-xl bg-muted/40 p-8 text-center">
                    <p className="text-sm font-medium">No items yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add products to your quote request to continue.
                    </p>
                  </div>
                ) : null}
              </div>

              <LinkedProducts
                products={upsells}
                loading={upsellsLoading}
                title={copy.title}
                subtitle={copy.subtitle}
                onItemClick={() => dispatch(closeQuote())}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="mb-3">
                    <p className="text-sm font-semibold">Items</p>
                    <p className="text-xs text-muted-foreground">
                      Quick summary before submitting.
                    </p>
                  </div>

                  <div className="divide-y divide-border">
                    {items.map((it) => (
                      <div
                        key={`${it.slug}__${it.variantId ?? ""}`}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={it.image ?? "/placeholder.png"}
                            alt={it.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {it.name}
                          </p>
                          {it.variantLabel ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {it.variantLabel}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            Qty: {it.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-sm font-semibold">Your details</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    We’ll use this to contact you with pricing & availability.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={customer.email || user}
                        onChange={(e) =>
                          dispatch(setCustomerEmail(e.target.value))
                        }
                        placeholder="you@company.com"
                        inputMode="email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Note (optional)</Label>
                      <Textarea
                        className="h-48 resize-none"
                        value={customer.note ?? ""}
                        onChange={(e) =>
                          dispatch(setCustomerNote(e.target.value))
                        }
                        placeholder="Branding, deadline, sizes, colors, delivery location, etc."
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tip: include target date + estimated quantity if you
                        have it.
                      </p>
                    </div>

                    {!canSubmit ? (
                      <p className="text-xs text-muted-foreground">
                        Enter a valid email to submit your quote request.
                      </p>
                    ) : null}

                    {submitError ? (
                      <p className="text-xs text-destructive">{submitError}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="sticky bottom-0 bg-white backdrop-blur">
            <QuoteSheetFooter
              step={step}
              canContinue={items.length > 0}
              canSubmit={canSubmit}
              onBack={() => dispatch(prevStep())}
              onContinue={() => dispatch(nextStep())}
              onSubmit={handleSubmit}
              onContinueShopping={() => dispatch(closeQuote())}
              subtotalLabel={formattedSubtotal ?? "—"}
              hasAnyPrice={hasAnyPrice}
              hasMissingPrice={hasMissingPrice}
              isSubmitting={isSubmitting}
            />
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
