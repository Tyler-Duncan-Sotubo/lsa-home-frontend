"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";
import { useWatch } from "react-hook-form";

import { Card, CardContent } from "@/shared/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { NG_REGION_CODES } from "@/shared/constants/ng-regions";

import { Loader2 } from "lucide-react";
import { CheckoutStepHeading } from "./checkout-step-heading";

type ShippingOption = {
  id: string;
  name: string;
  states: string[];
  area?: string;
  price: number;
};

interface CheckoutShippingSectionProps {
  form: CheckoutFormInstance;
  pickupLocations: Array<{
    id: string;
    name: string;
    address1: string;
    address2: string | null;
    instructions: string | null;
    state: string;
  }>;
  isLoadingPickupLocations: boolean;
  shippingOptions: ShippingOption[];
  isLoadingShippingOptions: boolean;
  isSettingShipping: boolean;
  isSettingPickup: boolean;
}

function formatNGN(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

function prettyState(s: string) {
  return (s ?? "").replace(/_/g, " ");
}

export function CheckoutShippingSection({
  form,
  pickupLocations,
  isLoadingPickupLocations,
  shippingOptions,
  isLoadingShippingOptions,
  isSettingShipping,
  isSettingPickup,
}: CheckoutShippingSectionProps) {
  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const stateField = useWatch({ control: form.control, name: "state" });
  const pickupState = useWatch({ control: form.control, name: "pickupState" });
  const selectedPickupId = useWatch({
    control: form.control,
    name: "pickupLocationId",
  });
  const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" });

  const isPickup = deliveryMethod === "pickup";
  const isShipping = deliveryMethod === "shipping";
  const showShippingOptions = isShipping && !!stateField?.trim();
  const isWhatsAppCheckout = paymentMethod === "whatsapp";

  return (
    <section className="p-4 space-y-5 bg-white md:p-6">
      <CheckoutStepHeading
        step={3}
        title="Shipping"
        action={
          isSettingPickup || isSettingShipping ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving…</span>
            </div>
          ) : null
        }
      />

      {/* Delivery method cards */}
      <FormField
        control={form.control}
        name="deliveryMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Choose a delivery method</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className={cn(
                  "grid gap-3 md:grid-cols-2",
                  isSettingPickup && "pointer-events-none opacity-60",
                )}
              >
                <label htmlFor="delivery-shipping" className="cursor-pointer">
                  <Card
                    className={cn(
                      "transition",
                      field.value === "shipping"
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-muted-foreground/30",
                    )}
                  >
                    <CardContent className="flex items-start gap-3">
                      <RadioGroupItem
                        value="shipping"
                        id="delivery-shipping"
                        className="mt-1"
                      />

                      <div className="flex-1">
                        <p className="text-sm font-semibold">Ship to address</p>
                      </div>
                    </CardContent>
                  </Card>
                </label>

                <label htmlFor="delivery-pickup" className="cursor-pointer">
                  <Card
                    className={cn(
                      "transition",
                      field.value === "pickup"
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-muted-foreground/30",
                    )}
                  >
                    <CardContent className="flex items-start gap-3">
                      <RadioGroupItem
                        value="pickup"
                        id="delivery-pickup"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Pick up</p>
                      </div>
                    </CardContent>
                  </Card>
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* PICKUP FLOW */}
      {isPickup && (
        <div className="space-y-3">
          {/* pickup state */}
          <FormField
            control={form.control}
            name="pickupState"
            rules={{ required: "State is required for pickup" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup state</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="h-14">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NG_REGION_CODES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {prettyState(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose your state to load pickup points.
                </p>
              </FormItem>
            )}
          />

          {/* pickup points */}
          <FormField
            control={form.control}
            name="pickupLocationId"
            rules={{ required: "Please select a pickup point" }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm">Pickup points</FormLabel>
                  {pickupState ? (
                    <span className="text-xs text-muted-foreground">
                      {prettyState(pickupState)}
                    </span>
                  ) : null}
                </div>

                <FormControl>
                  <div className="space-y-2">
                    {!pickupState ? (
                      <Card className="border-dashed">
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Select a state to see pickup points.
                          </p>
                        </CardContent>
                      </Card>
                    ) : isLoadingPickupLocations ? (
                      <Card className="border-dashed">
                        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading pickup points…
                        </CardContent>
                      </Card>
                    ) : pickupLocations.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="p-2">
                          <p className="text-sm text-muted-foreground">
                            No pickup points available for this state.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className={cn(
                          "space-y-2",
                          isSettingPickup && "pointer-events-none opacity-60",
                        )}
                      >
                        {pickupLocations.map((loc) => {
                          const selected = field.value === loc.id;
                          const inputId = `pickup-point-${loc.id}`;
                          return (
                            <label
                              key={loc.id}
                              htmlFor={inputId}
                              className="block cursor-pointer"
                            >
                              <Card
                                className={cn(
                                  "transition",
                                  selected
                                    ? "border-primary ring-1 ring-primary"
                                    : "hover:border-muted-foreground/30",
                                )}
                              >
                                <CardContent className="flex items-start gap-2">
                                  <RadioGroupItem value={loc.id} id={inputId} />

                                  <div className="flex-1">
                                    <p className="text-xs">
                                      <span className="font-semibold">
                                        {loc.name}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        — {loc.address1}
                                        {loc.address2
                                          ? `, ${loc.address2}`
                                          : ""}{" "}
                                        • {prettyState(loc.state)}
                                      </span>
                                    </p>
                                    {loc.instructions ? (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {loc.instructions}
                                      </p>
                                    ) : null}
                                  </div>
                                </CardContent>
                              </Card>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    )}
                  </div>
                </FormControl>

                {/* keep validation message */}
                {pickupLocations.length > 0 ? <FormMessage /> : null}

                {selectedPickupId ? (
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll prepare your order for pickup at the selected
                    location.
                  </p>
                ) : null}
              </FormItem>
            )}
          />
        </div>
      )}

      {showShippingOptions && (
        <FormField
          control={form.control}
          name="shippingOptionId"
          rules={
            isWhatsAppCheckout
              ? undefined
              : { required: "Please select a shipping option" }
          }
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                Shipping option
                {isWhatsAppCheckout ? (
                  <span className="ml-1 font-normal text-muted-foreground">
                    (optional)
                  </span>
                ) : null}
              </FormLabel>
              <FormControl>
                {isLoadingShippingOptions ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading options…
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    No shipping options available for this location.
                  </p>
                ) : (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className={cn(
                      "gap-0 divide-y rounded-lg border overflow-hidden",
                      isSettingShipping && "opacity-60 pointer-events-none",
                    )}
                  >
                    {shippingOptions.map((opt) => {
                      const selected = field.value === opt.id;
                      const inputId = `shipping-option-${opt.id}`;
                      return (
                        <label
                          key={opt.id}
                          htmlFor={inputId}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors",
                            selected ? "bg-primary/5" : "hover:bg-muted/40",
                          )}
                        >
                          <RadioGroupItem value={opt.id} id={inputId} />

                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium leading-tight">
                              {opt.name}
                            </span>
                            {opt.area && (
                              <span className="block text-xs text-muted-foreground">
                                {opt.states[0]} · {opt.area}
                              </span>
                            )}
                          </span>

                          <span
                            className={cn(
                              "text-sm font-semibold shrink-0",
                              selected ? "text-primary" : "text-foreground",
                            )}
                          >
                            {formatNGN(opt.price)}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </section>
  );
}
