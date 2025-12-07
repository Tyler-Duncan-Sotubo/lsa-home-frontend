"use client";

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/types/checkout";

interface CheckoutPaymentSectionProps {
  form: CheckoutFormInstance;
}

export function CheckoutPaymentSection({ form }: CheckoutPaymentSectionProps) {
  return (
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
                    field.value === "paystack" && "border-primary bg-primary/5"
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
                    field.value === "bank" && "border-primary bg-primary/5"
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
                    field.value === "pos" && "border-primary bg-primary/5"
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
  );
}
