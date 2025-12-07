"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { selectCartItems, selectCartTotal, clearCart } from "@/store/cartSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Form } from "@/components/ui/form";
import { calculateShippingRate } from "@/lib/shipping";
import {
  CheckoutFormInstance,
  CheckoutFormValues,
  checkoutSchema,
} from "@/types/checkout";
import { CheckoutContactSection } from "./_components/checkout-contact-section";
import { CheckoutDeliverySection } from "./_components/checkout-delivery-section";
import { CheckoutPaymentSection } from "./_components/checkout-payment-section";
import { CheckoutOrderSummary } from "./_components/checkout-order-summary";
import LsaLoading from "@/components/ui/lsa-loading";

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const form: CheckoutFormInstance = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      marketingOptIn: false,
      firstName: "",
      lastName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      country: "NG",
      deliveryMethod: "shipping",
      paymentMethod: "paystack",
    },
  });

  // Watch fields relevant for shipping
  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const stateField = useWatch({ control: form.control, name: "state" });
  const cityField = useWatch({ control: form.control, name: "city" });

  // We only calculate shipping when we have enough address info
  const canCalculateShipping =
    deliveryMethod === "shipping" &&
    !!stateField?.trim() &&
    !!cityField?.trim();

  // Subtotal
  const formattedSubtotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(cartTotal);

  // Shipping
  let shippingAmount: number | null = null;
  if (canCalculateShipping) {
    shippingAmount = calculateShippingRate({
      deliveryMethod,
      state: stateField,
      items, // CartItem[] is compatible with ShippingCartItem[]
    });
  }

  const formattedShipping =
    shippingAmount !== null
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(shippingAmount)
      : null;

  // Total = subtotal + shipping (if known)
  const totalWithShipping =
    shippingAmount !== null ? cartTotal + shippingAmount : cartTotal;

  const formattedTotalWithShipping = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(totalWithShipping);

  const onSubmit = async (values: CheckoutFormValues) => {
    const payload = {
      contact: {
        email: values.email,
        marketingOptIn: values.marketingOptIn,
      },
      shipping: {
        firstName: values.firstName,
        lastName: values.lastName,
        address1: values.address1,
        address2: values.address2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        phone: values.phone,
        country: values.country,
      },
      deliveryMethod: values.deliveryMethod,
      paymentMethod: values.paymentMethod,
      items,
      cartTotal,
      shippingAmount, // can be null, your API should recompute anyway
      totalWithShipping,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Checkout failed");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setIsSubmitting(false);

      // ✅ Clear cart only after Woo order is successfully created
      if (data.orderId) {
        dispatch(clearCart());
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // For mobile top bar: show subtotal until shipping is known
  const mobileAmount = canCalculateShipping
    ? formattedTotalWithShipping
    : formattedSubtotal;

  if (isSubmitting) return <LsaLoading />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main
        id="checkout-main"
        className="mx-auto flex w-[95%] max-w-6xl flex-col gap-6 py-6 md:flex-row"
      >
        {/* MOBILE: order summary toggle */}
        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-4"
            onClick={() => setIsSummaryOpen((prev) => !prev)}
          >
            {isSummaryOpen ? "Hide order summary" : "Show order summary"}
          </button>
          <span className="text-sm font-semibold">{mobileAmount}</span>
        </div>

        {/* LEFT: Checkout form */}
        <section className="flex-1 space-y-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              noValidate
            >
              <CheckoutContactSection form={form} />
              <CheckoutDeliverySection form={form} />
              <CheckoutPaymentSection form={form} />

              {/* Legal text */}
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

        {/* RIGHT: Order summary */}
        <CheckoutOrderSummary
          items={items}
          formattedSubtotal={formattedSubtotal}
          formattedShipping={formattedShipping}
          formattedTotal={formattedTotalWithShipping}
          isSummaryOpen={isSummaryOpen}
          canCalculateShipping={canCalculateShipping}
          isPickup={deliveryMethod === "pickup"} // 👈 NEW
        />
      </main>
    </div>
  );
}
