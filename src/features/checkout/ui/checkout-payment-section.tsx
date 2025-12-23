"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { FormField, FormItem, FormControl } from "@/shared/ui/form";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";
import { Card, CardContent } from "@/shared/ui/card";

import { FaCreditCard, FaUniversity } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import { FiCopy, FiCheck } from "react-icons/fi";

interface CheckoutPaymentSectionProps {
  form: CheckoutFormInstance;
  isSubmitting?: boolean;
  // optional: pass these from config/backend
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    note?: string; // e.g. "Use your order ID as reference"
  };
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op: clipboard can fail in some contexts
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs transition hover:bg-muted"
      >
        {copied ? (
          <FiCheck className="h-4 w-4" />
        ) : (
          <FiCopy className="h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function CheckoutPaymentSection({
  form,
  bankDetails,
  isSubmitting = false,
}: CheckoutPaymentSectionProps) {
  const details = useMemo(
    () =>
      bankDetails ?? {
        bankName: "GTBank",
        accountName: "Acme Stores Ltd",
        accountNumber: "0123456789",
        note: "Use your order ID as payment reference.",
      },
    [bankDetails]
  );

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6 mt-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Payment</h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <HiLockClosed className="h-3.5 w-3.5" />
          <span>All transactions are secure and encrypted.</span>
        </div>
      </div>

      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => {
          const isBank = field.value === "bank";
          const isPaystack = field.value === "paystack";

          return (
            <FormItem>
              <FormControl>
                <div className="space-y-3">
                  {/* Paystack */}
                  <button
                    type="button"
                    onClick={() => field.onChange("paystack")}
                    className="w-full text-left"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between rounded-md border p-4 transition",
                        isPaystack
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md border",
                            isPaystack
                              ? "border-primary bg-primary/10"
                              : "bg-muted/40"
                          )}
                        >
                          <FaCreditCard className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Paystack</p>
                          <p className="text-xs text-muted-foreground">
                            Pay with card, bank transfer, or USSD
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px]",
                          isPaystack
                            ? "border-primary text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {isPaystack ? "Selected" : "Select"}
                      </span>
                    </div>
                  </button>

                  {/* Bank transfer */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("bank")}
                      className="w-full text-left"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-between rounded-md border p-4 transition",
                          isBank
                            ? "border-primary ring-1 ring-primary bg-primary/5"
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-md border",
                              isBank
                                ? "border-primary bg-primary/10"
                                : "bg-muted/40"
                            )}
                          >
                            <FaUniversity className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Bank transfer
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Transfer directly to our bank account
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px]",
                            isBank
                              ? "border-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {isBank ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>

                    {/* Expanded bank details */}
                    {isBank && (
                      <Card className="border-primary/30">
                        <CardContent className="space-y-3 p-4">
                          <p className="text-sm font-semibold">
                            Bank account details
                          </p>

                          <CopyRow label="Bank" value={details.bankName} />
                          <CopyRow
                            label="Account name"
                            value={details.accountName}
                          />
                          <CopyRow
                            label="Account number"
                            value={details.accountNumber}
                          />

                          {details.note ? (
                            <p className="text-xs text-muted-foreground">
                              {details.note}
                            </p>
                          ) : null}

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-10"
                            >
                              I’ve sent the transfer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          );
        }}
      />

      <Button
        type="submit"
        className="h-12 w-full font-bold text-base"
        isLoading={isSubmitting}
      >
        Pay now
      </Button>
    </section>
  );
}
