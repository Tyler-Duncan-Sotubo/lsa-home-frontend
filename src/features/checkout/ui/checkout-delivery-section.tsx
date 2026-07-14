"use client";

import { Input } from "@/shared/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";
import { useWatch } from "react-hook-form";

import { CheckoutStepHeading } from "./checkout-step-heading";

interface CheckoutDeliverySectionProps {
  form: CheckoutFormInstance;
}

export function CheckoutDeliverySection({
  form,
}: CheckoutDeliverySectionProps) {
  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  const isShipping = deliveryMethod === "shipping";
  const isWhatsAppCheckout = paymentMethod === "whatsapp";

  return (
    <section className="p-4 space-y-5 border shadow-sm rounded-xl bg-card md:p-6">
      <CheckoutStepHeading step={2} title="Delivery" />

      {/* Customer name stays */}
      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          rules={{ required: "First name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          rules={{ required: "Last name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SHIPPING FLOW — WhatsApp skips the detailed address, per the
          "delivery method decided, no address fields" simplification. */}
      {isShipping && !isWhatsAppCheckout && (
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="address1"
            rules={{ required: "Address is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-3 md:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              rules={{ required: "City is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              rules={{ required: "State is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            rules={{ required: "Phone is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll use this to update you about your delivery.
                </p>
              </FormItem>
            )}
          />
        </div>
      )}
    </section>
  );
}
