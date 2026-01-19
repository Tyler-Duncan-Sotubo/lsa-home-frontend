/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { FormField, FormItem, FormControl } from "@/shared/ui/form";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";
import { Card, CardContent } from "@/shared/ui/card";
import { FaCreditCard, FaUniversity } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import { FiCopy, FiCheck } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { usePaymentMethods } from "../hooks/use-payment-methods";
import type {
  ApiBankTransfer,
  ApiCash,
  ApiGateway,
  ApiPaymentMethod,
} from "../types/payment-methods.type";
import Image from "next/image";

interface CheckoutPaymentSectionProps {
  form: CheckoutFormInstance;
  isSubmitting?: boolean;
}

const GATEWAY_LOGOS: Record<string, string> = {
  paystack:
    "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019bcb41-c4c8-7a3b-8e2d-3f78def4a2e5-Integrations-Paystack-1724x970-1.svg",
  stripe:
    "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/theme/tmp/019bc8ed-fcfc-77b5-a786-46c38e22266d-1768602598286-logo.png",
};

function GatewayIcon({ provider }: { provider: string }) {
  const src = GATEWAY_LOGOS[provider];
  if (src) {
    return (
      <div className="relative h-14 w-20">
        <Image
          src={src}
          alt={`${provider} logo`}
          fill
          className="object-contain"
        />
      </div>
    );
  }
  return <FaCreditCard className="h-10 w-10" />;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
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

function TitleCase(s: string) {
  return (s ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function MethodCard(props: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const { selected, title, description, icon, onClick } = props;
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div
        className={cn(
          "flex items-center justify-between rounded-md border p-4 transition",
          selected
            ? "border-primary ring-1 ring-primary bg-primary/5"
            : "hover:border-muted-foreground/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-20 items-center justify-center">
            {icon}
          </div>

          <div>
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px]",
            selected ? "border-primary text-primary" : "text-muted-foreground"
          )}
        >
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </button>
  );
}

// Helper: does this look like a valid selection?
function isValidPaymentValue(v: unknown) {
  if (typeof v !== "string") return false;
  if (v === "bank") return true;
  if (v === "cash") return true;
  if (v.startsWith("gateway:") && v.split(":")[1]?.trim()) return true;
  return false;
}

export function CheckoutPaymentSection({
  form,
  isSubmitting = false,
}: CheckoutPaymentSectionProps) {
  const { data, isLoading, isError } = usePaymentMethods();

  const methods: ApiPaymentMethod[] = useMemo(() => {
    const raw = (data as any)?.methods ?? (data as any)?.data?.methods ?? [];
    return Array.isArray(raw) ? (raw as ApiPaymentMethod[]) : [];
  }, [data]);

  const gateways = methods.filter(
    (m): m is ApiGateway => m.method === "gateway"
  );
  const bankTransfer = methods.find(
    (m): m is ApiBankTransfer => m.method === "bank_transfer"
  );
  const cash = methods.find((m): m is ApiCash => m.method === "cash");

  const bankDetails = bankTransfer?.bankDetails ?? null;

  // ✅ Set a default payment method once methods load
  useEffect(() => {
    if (!methods.length) return;

    const current = form.getValues("paymentMethod") as unknown;
    if (isValidPaymentValue(current)) return;

    const next = gateways[0]?.provider
      ? (`gateway:${gateways[0].provider}` as const)
      : bankTransfer
      ? "bank"
      : cash
      ? "cash"
      : "";

    if (next)
      form.setValue("paymentMethod" as any, next as any, {
        shouldValidate: true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.length, gateways.length, !!bankTransfer, !!cash]);

  const selectedValue = form.watch("paymentMethod") as unknown;
  const canPayNow =
    !isLoading && methods.length > 0 && isValidPaymentValue(selectedValue);

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6 mt-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Payment</h2>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <HiLockClosed className="h-3.5 w-3.5" />
          <span>All transactions are secure and encrypted.</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">
          Loading payment methods…
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          Failed to load payment methods. Please refresh.
        </div>
      ) : methods.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No payment methods available for this store.
        </div>
      ) : (
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => {
            const val = String(field.value ?? "");

            const isBank = val === "bank";
            const isCash = val === "cash";
            const isGatewaySelected = val.startsWith("gateway:");
            const gatewayProvider = isGatewaySelected
              ? val.split(":")[1] ?? ""
              : "";

            return (
              <FormItem>
                <FormControl>
                  <div className="space-y-3">
                    {/* Gateways */}
                    {gateways.map((g) => {
                      const value = `gateway:${g.provider}`;
                      const selected = val === value;

                      const title = TitleCase(g.provider);
                      const description =
                        g.provider === "paystack"
                          ? "Pay with card, bank transfer, or USSD"
                          : "Pay with card or supported options";

                      return (
                        <MethodCard
                          key={value}
                          selected={selected}
                          title={title}
                          description={description}
                          icon={<GatewayIcon provider={g.provider} />}
                          onClick={() => field.onChange(value)}
                        />
                      );
                    })}

                    {/* Optional: gateway helper text */}
                    {isGatewaySelected ? (
                      <div className="text-xs text-muted-foreground">
                        You’ll be redirected to complete payment via{" "}
                        <span className="font-medium">
                          {TitleCase(gatewayProvider)}
                        </span>
                        .
                      </div>
                    ) : null}

                    {/* Bank transfer */}
                    {bankTransfer ? (
                      <div className="space-y-2">
                        <MethodCard
                          selected={isBank}
                          title="Bank transfer"
                          description="Transfer directly to our bank account"
                          icon={<FaUniversity className="h-5 w-5" />}
                          onClick={() => field.onChange("bank")}
                        />

                        {isBank && bankDetails && (
                          <Card className="border-primary/30">
                            <CardContent className="space-y-3 p-4">
                              <p className="text-sm font-semibold">
                                Bank account details
                              </p>

                              <CopyRow
                                label="Bank"
                                value={bankDetails.bankName}
                              />
                              <CopyRow
                                label="Account name"
                                value={bankDetails.accountName}
                              />
                              <CopyRow
                                label="Account number"
                                value={bankDetails.accountNumber}
                              />

                              {bankDetails.instructions ? (
                                <p className="text-xs text-muted-foreground">
                                  {bankDetails.instructions}
                                </p>
                              ) : null}

                              <p className="text-red-500 text-sm">
                                Proof of payment will be required to process
                                your order.
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {isBank && !bankDetails ? (
                          <div className="text-xs text-muted-foreground">
                            Bank details are not configured for this store.
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Cash */}
                    {cash ? (
                      <MethodCard
                        selected={isCash}
                        title="Cash"
                        description={
                          cash.note ?? "Pay with cash on delivery/pickup."
                        }
                        icon={<MdAttachMoney className="h-6 w-6" />}
                        onClick={() => field.onChange("cash")}
                      />
                    ) : null}

                    {/* invalid */}
                    {val && !isValidPaymentValue(val) ? (
                      <div className="text-xs text-muted-foreground">
                        Selected payment method is unavailable. Please choose
                        another.
                      </div>
                    ) : null}
                  </div>
                </FormControl>
              </FormItem>
            );
          }}
        />
      )}

      <Button
        type="submit"
        className="h-12 w-full font-bold text-base"
        isLoading={isSubmitting}
        disabled={!canPayNow || isSubmitting}
      >
        Pay now
      </Button>
    </section>
  );
}
