"use client";

import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/types/checkout";

interface CheckoutDeliverySectionProps {
  form: CheckoutFormInstance;
}

export function CheckoutDeliverySection({
  form,
}: CheckoutDeliverySectionProps) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6">
      <h2 className="text-base font-semibold">Delivery</h2>

      {/* Delivery method */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Choose a delivery method</p>

        <FormField
          control={form.control}
          name="deliveryMethod"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-2 md:grid-cols-2"
                >
                  <label
                    className={cn(
                      "flex items-center justify-between rounded-md border p-3 text-sm",
                      field.value === "shipping" &&
                        "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="shipping" />
                      <span>Ship</span>
                    </div>
                  </label>

                  <label
                    className={cn(
                      "flex items-center justify-between rounded-md border p-3 text-sm",
                      field.value === "pickup" && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="pickup" />
                      <span>Pick up</span>
                    </div>
                  </label>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Shipping address */}
      <div className="space-y-3">
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
    </section>
  );
}
