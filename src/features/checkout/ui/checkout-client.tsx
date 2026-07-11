"use client";

import { useEffect } from "react";
import { trackEvent } from "@/shared/analytics/track";

import Link from "next/link";
import { Form } from "@/shared/ui/form";
import { CheckoutContactSection } from "@/features/checkout/ui/checkout-contact-section";
import { CheckoutDeliverySection } from "@/features/checkout/ui/checkout-delivery-section";
import { CheckoutPaymentSection } from "@/features/checkout/ui/checkout-payment-section";
import { CheckoutOrderSummary } from "@/features/checkout/ui/checkout-order-summary";

import { useCheckoutController } from "@/features/checkout/hooks/use-checkout-controller";
import { LoadingProgress } from "@/shared/ui/loading/loading-progress";
import type { Product } from "@/features/Products/types/products";

export function CheckoutClient({
  checkoutId,
  relatedProducts = [],
}: {
  checkoutId: string;
  relatedProducts?: Product[];
}) {
  useEffect(() => {
    trackEvent("begin_checkout", { checkoutId, path: "/checkout" });
  }, [checkoutId]);

  const {
    form,
    items,
    isSubmitting,
    isSummaryOpen,
    toggleSummary,
    deliveryMethod,
    canCalculateShipping,
    formattedSubtotal,
    formattedShipping,
    formattedDiscount,
    formattedTotal,
    mobileAmount,
    onSubmit,
    isLoading,
    pickupLocations,
    isLoadingPickupLocations,
    isSettingPickup,
    shippingOptions,
    isLoadingShippingOptions,
    isSettingShipping,
    appliedDiscountCodeId,
    applyDiscountCode,
    isApplyingDiscountCode,
    removeDiscountCode,
    isRemovingDiscountCode,
  } = useCheckoutController(checkoutId);

  if (isLoading) return <LoadingProgress />;

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <main className="mx-auto flex w-[95%] max-w-6xl flex-col gap-6 py-6 md:flex-row md:py-10">
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm md:hidden">
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-4"
            onClick={toggleSummary}
          >
            {isSummaryOpen ? "Hide order summary" : "Show order summary"}
          </button>
          <span className="text-sm font-semibold">{mobileAmount}</span>
        </div>

        <section className="flex-1 space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              noValidate
            >
              <CheckoutContactSection form={form} />
              <CheckoutDeliverySection
                form={form}
                pickupLocations={pickupLocations}
                isLoadingPickupLocations={isLoadingPickupLocations}
                isSettingPickup={isSettingPickup}
                shippingOptions={shippingOptions}
                isLoadingShippingOptions={isLoadingShippingOptions}
                isSettingShipping={isSettingShipping}
              />
              <CheckoutPaymentSection
                form={form}
                isSubmitting={isSubmitting}
                canProceedToPayment={canCalculateShipping}
              />

              <div className="flex flex-col gap-3 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link href="/policies/terms" className="underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/policies/privacy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </form>
          </Form>
        </section>

        <CheckoutOrderSummary
          items={items}
          formattedSubtotal={formattedSubtotal}
          formattedShipping={formattedShipping}
          formattedDiscount={formattedDiscount}
          formattedTotal={formattedTotal}
          isSummaryOpen={isSummaryOpen}
          canCalculateShipping={canCalculateShipping}
          isPickup={deliveryMethod === "pickup"}
          relatedProducts={relatedProducts}
          appliedDiscountCodeId={appliedDiscountCodeId}
          onApplyDiscountCode={applyDiscountCode}
          isApplyingDiscountCode={isApplyingDiscountCode}
          onRemoveDiscountCode={removeDiscountCode}
          isRemovingDiscountCode={isRemovingDiscountCode}
        />
      </main>
    </div>
  );
}
