// app/checkout/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { selectCartItems, selectCartTotal } from "@/store/cartSlice";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type DeliveryMethod = "shipping" | "pickup";
type PaymentMethod = "paystack" | "bank" | "pos";

type CheckoutFormValues = {
  // contact
  email: string;
  marketingOptIn: boolean;

  // shipping
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode?: string;
  phone: string;
  country: string;

  // choices
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
};

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotal);
  const router = useRouter();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const form = useForm<CheckoutFormValues>({
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

  const formattedTotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(cartTotal);

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
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // show a toast / error UI in real app
        console.error("Checkout failed");
        return;
      }

      const data = await res.json();

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
          <span className="text-sm font-semibold">{formattedTotal}</span>
        </div>

        {/* LEFT: Checkout form */}
        <section className="flex-1 space-y-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
              noValidate
            >
              {/* CONTACT */}
              <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">Contact</h2>
                  <Link
                    href="/account/login"
                    className="text-sm underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or mobile phone number</FormLabel>
                        <FormControl>
                          <Input type="text" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketingOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Email me with news and offers
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* DELIVERY */}
              <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6">
                <h2 className="text-base font-semibold">Delivery</h2>

                {/* Delivery method */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Choose a delivery method
                  </p>

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
                                field.value === "pickup" &&
                                  "border-primary bg-primary/5"
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

              {/* PAYMENT */}
              <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Payment</h2>
                  <p className="text-xs text-muted-foreground">
                    All transactions are secure and encrypted.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="space-y-2"
                        >
                          <label
                            className={cn(
                              "flex items-center justify-between rounded-md border p-3 text-sm",
                              field.value === "paystack" &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="paystack" />
                              <span>Paystack</span>
                            </div>
                          </label>

                          <label
                            className={cn(
                              "flex items-center justify-between rounded-md border p-3 text-sm",
                              field.value === "bank" &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="bank" />
                              <span>Bank Transfer</span>
                            </div>
                          </label>

                          <label
                            className={cn(
                              "flex items-center justify-between rounded-md border p-3 text-sm",
                              field.value === "pos" &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="pos" />
                              <span>POS</span>
                            </div>
                          </label>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="h-12 w-full md:self-end font-bold text-base"
                >
                  Pay now
                </Button>
              </section>

              {/* Submit */}
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

        {/* RIGHT: Order summary (sticky on desktop) */}
        <aside
          className={cn(
            "w-full md:w-[450px] lg:w-[450px]",
            "md:sticky md:top-6 md:self-start"
          )}
        >
          <div
            className={cn(
              "mb-4 rounded-lg border bg-card p-4 md:mb-0 md:block",
              !isSummaryOpen && "hidden md:block"
            )}
          >
            {/* Items list */}
            <div className="md:max-h-[400px] space-y-3 overflow-y-auto border-b pb-3 text-sm">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.attributes)}`}
                    className="flex gap-5 mt-3 space-y-3"
                  >
                    {/* Image + quantity badge */}
                    <div className="relative h-24 w-24 shrink-0 overflow-visible rounded-md bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          No image
                        </div>
                      )}

                      {/* Quantity badge */}
                      <span
                        className="
      absolute top-0 right-0
      translate-x-1/3 -translate-y-1/3
      inline-flex h-8 min-w-8 items-center justify-center
      rounded-full bg-primary-foreground text-white
      text-[14px] font-bold shadow-md z-50
    "
                      >
                        {item.quantity}
                      </span>
                    </div>

                    {/* Text content */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>

                        {/* Attributes as flex-col */}
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

                        <div className="flex items-center justify-end text-md font-medium px-3">
                          <span className="font-semibold">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                            }).format(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cost summary */}
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formattedTotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-xs text-muted-foreground">
                  Enter shipping address
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
