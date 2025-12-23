"use client";

import Link from "next/link";
import { Form } from "@/shared/ui/form";
import LsaLoading from "@/shared/ui/lsa-loading";

import { CheckoutContactSection } from "@/features/checkout/ui/checkout-contact-section";
import { CheckoutDeliverySection } from "@/features/checkout/ui/checkout-delivery-section";
import { CheckoutPaymentSection } from "@/features/checkout/ui/checkout-payment-section";
import { CheckoutOrderSummary } from "@/features/checkout/ui/checkout-order-summary";

import { useCheckoutController } from "@/features/checkout/hooks/use-checkout-controller";

export function CheckoutClient({ checkoutId }: { checkoutId: string }) {
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
    formattedTotal,
    mobileAmount,
    onSubmit,
    isLoading,
    pickupLocations,
    isLoadingPickupLocations,
    isSettingPickup,
  } = useCheckoutController(checkoutId);

  if (isLoading) return <LsaLoading />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-[95%] max-w-6xl flex-col gap-6 py-6 md:flex-row">
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-4"
            onClick={toggleSummary}
          >
            {isSummaryOpen ? "Hide order summary" : "Show order summary"}
          </button>
          <span className="text-sm font-semibold">{mobileAmount}</span>
        </div>

        <section className="flex-1 space-y-8">
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
              />
              <CheckoutPaymentSection form={form} isSubmitting={isSubmitting} />

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
          formattedTotal={formattedTotal}
          isSummaryOpen={isSummaryOpen}
          canCalculateShipping={canCalculateShipping}
          isPickup={deliveryMethod === "pickup"}
        />
      </main>
    </div>
  );
}
