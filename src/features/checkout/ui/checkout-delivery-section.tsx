"use client";

import { Input } from "@/shared/ui/input";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { NG_REGION_CODES } from "@/shared/constants/ng-regions";

// shadcn
import { Card, CardContent } from "@/shared/ui/card";

// icons
import { Loader2, MapPin, Truck } from "lucide-react";

interface CheckoutDeliverySectionProps {
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
  isSettingPickup: boolean;
}

function prettyState(s: string) {
  return (s ?? "").replace(/_/g, " ");
}

export function CheckoutDeliverySection({
  form,
  pickupLocations,
  isLoadingPickupLocations,
  isSettingPickup,
}: CheckoutDeliverySectionProps) {
  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });
  const pickupState = useWatch({ control: form.control, name: "pickupState" });
  const selectedPickupId = useWatch({
    control: form.control,
    name: "pickupLocationId",
  });

  const isPickup = deliveryMethod === "pickup";
  const isShipping = deliveryMethod === "shipping";

  return (
    <section className="space-y-5 rounded-lg border bg-card md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Delivery</h2>

        {isPickup && isSettingPickup ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving pickup…</span>
          </div>
        ) : null}
      </div>

      {/* Delivery method cards */}
      <FormField
        control={form.control}
        name="deliveryMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Choose a delivery method</FormLabel>
            <FormControl>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => field.onChange("shipping")}
                  className={cn(
                    "text-left",
                    isSettingPickup && "pointer-events-none"
                  )}
                >
                  <Card
                    className={cn(
                      "transition",
                      field.value === "shipping"
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <CardContent className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border",
                          field.value === "shipping"
                            ? "border-primary bg-primary/5"
                            : "bg-muted/40"
                        )}
                      >
                        <Truck className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">
                            Ship to address
                          </p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[11px]",
                              field.value === "shipping"
                                ? "border-primary text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {field.value === "shipping" ? "Selected" : "Select"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Delivery to your doorstep.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>

                <button
                  type="button"
                  onClick={() => field.onChange("pickup")}
                  className={cn(
                    "text-left",
                    isSettingPickup && "pointer-events-none"
                  )}
                >
                  <Card
                    className={cn(
                      "transition",
                      field.value === "pickup"
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-muted-foreground/30"
                    )}
                  >
                    <CardContent className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border",
                          field.value === "pickup"
                            ? "border-primary bg-primary/5"
                            : "bg-muted/40"
                        )}
                      >
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">Pick up</p>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[11px]",
                              field.value === "pickup"
                                ? "border-primary text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {field.value === "pickup" ? "Selected" : "Select"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Collect from a nearby pickup point.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                    <SelectTrigger className="h-12">
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
                          <Loader2 className="h-4 w-4 animate-spin" />
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
                      pickupLocations.map((loc) => {
                        const selected = field.value === loc.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            disabled={isSettingPickup}
                            onClick={() => field.onChange(loc.id)}
                            className={cn(
                              "w-full text-left",
                              isSettingPickup &&
                                "pointer-events-none opacity-60"
                            )}
                          >
                            <Card
                              className={cn(
                                "transition",
                                selected
                                  ? "border-primary ring-1 ring-primary"
                                  : "hover:border-muted-foreground/30"
                              )}
                            >
                              <CardContent className="flex items-start gap-2">
                                <div
                                  className={cn(
                                    "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border",
                                    selected
                                      ? "border-primary bg-primary/5"
                                      : "bg-muted/40"
                                  )}
                                >
                                  <MapPin className="h-4 w-4" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold">
                                        {loc.name}
                                      </p>
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {loc.address1}
                                        {loc.address2
                                          ? `, ${loc.address2}`
                                          : ""}{" "}
                                        • {prettyState(loc.state)}
                                      </p>
                                      {loc.instructions ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          {loc.instructions}
                                        </p>
                                      ) : null}
                                    </div>

                                    <span
                                      className={cn(
                                        "mt-0.5 rounded-full border px-2 py-0.5 text-[11px]",
                                        selected
                                          ? "border-primary text-primary"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      {selected ? "Selected" : "Select"}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </button>
                        );
                      })
                    )}
                  </div>
                </FormControl>

                {/* keep validation message */}
                {pickupLocations.length > 0 ? <FormMessage /> : null}

                {selectedPickupId ? (
                  <p className="text-xs text-muted-foreground">
                    We’ll prepare your order for pickup at the selected
                    location.
                  </p>
                ) : null}
              </FormItem>
            )}
          />
        </div>
      )}

      {/* SHIPPING FLOW */}
      {isShipping && (
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
