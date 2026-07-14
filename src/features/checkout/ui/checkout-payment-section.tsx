/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";
import { Card, CardContent } from "@/shared/ui/card";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { FaCreditCard, FaUniversity, FaWhatsapp } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import { FiCopy, FiCheck } from "react-icons/fi";
import { MdAttachMoney } from "react-icons/md";
import { isValidPhoneNumber } from "libphonenumber-js";
import { usePaymentMethods } from "../hooks/use-payment-methods";
import type {
  ApiBankTransfer,
  ApiCash,
  ApiGateway,
  ApiPaymentMethod,
  ApiWhatsApp,
} from "../types/payment-methods.type";
import Image from "next/image";
import { CheckoutStepHeading } from "./checkout-step-heading";

interface CheckoutPaymentSectionProps {
  form: CheckoutFormInstance;
  isSubmitting?: boolean;
  // false while a shipping option (or pickup point) hasn't been chosen yet —
  // paying before that would let an order through with no fulfillment plan.
  canProceedToPayment?: boolean;
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
      <div className="relative w-20 h-14">
        <Image
          src={src}
          alt={`${provider} logo`}
          fill
          className="object-contain"
        />
      </div>
    );
  }
  return <FaCreditCard className="w-10 h-10" />;
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
    <div className="flex items-center justify-between gap-3 px-3 py-2 border rounded-md bg-muted/30">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs transition hover:bg-muted"
      >
        {copied ? (
          <FiCheck className="w-4 h-4" />
        ) : (
          <FiCopy className="w-4 h-4" />
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
  value: string;
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const { value, selected, title, description, icon } = props;
  const inputId = `payment-method-${value}`;

  return (
    <label htmlFor={inputId} className="block cursor-pointer">
      <div
        className={cn(
          "flex items-center gap-3 rounded-md border py-1 px-3 transition",
          selected
            ? "border-primary ring-1 ring-primary bg-white"
            : "hover:border-muted-foreground/30",
        )}
      >
        <RadioGroupItem value={value} id={inputId} />

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <p className="text-sm font-semibold whitespace-nowrap">{title}</p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-xs truncate text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center w-20 h-14 shrink-0">
          {icon}
        </div>
      </div>
    </label>
  );
}

// Helper: does this look like a valid selection?
function isValidPaymentValue(v: unknown) {
  if (typeof v !== "string") return false;
  if (v === "bank") return true;
  if (v === "cash") return true;
  if (v === "whatsapp") return true;
  if (v.startsWith("gateway:") && v.split(":")[1]?.trim()) return true;
  return false;
}

export function CheckoutPaymentSection({
  form,
  isSubmitting = false,
  canProceedToPayment = true,
}: CheckoutPaymentSectionProps) {
  const { data, isLoading, isError } = usePaymentMethods();

  const methods: ApiPaymentMethod[] = useMemo(() => {
    const raw = (data as any)?.methods ?? (data as any)?.data?.methods ?? [];
    return Array.isArray(raw) ? (raw as ApiPaymentMethod[]) : [];
  }, [data]);

  const gateways = methods.filter(
    (m): m is ApiGateway => m.method === "gateway",
  );
  const bankTransfer = methods.find(
    (m): m is ApiBankTransfer => m.method === "bank_transfer",
  );
  const cash = methods.find((m): m is ApiCash => m.method === "cash");
  const whatsapp = methods.find(
    (m): m is ApiWhatsApp => m.method === "whatsapp",
  );

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
          : whatsapp
            ? "whatsapp"
            : "";

    if (next)
      form.setValue("paymentMethod" as any, next as any, {
        shouldValidate: true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.length, gateways.length, !!bankTransfer, !!cash, !!whatsapp]);

  const selectedValue = form.watch("paymentMethod") as unknown;
  const canPayNow =
    !isLoading &&
    methods.length > 0 &&
    isValidPaymentValue(selectedValue) &&
    canProceedToPayment;

  const submitLabel =
    selectedValue === "whatsapp"
      ? "Continue on WhatsApp"
      : selectedValue === "bank" || selectedValue === "cash"
        ? "Place order"
        : "Pay now";

  return (
    <section className="p-4 mt-6 space-y-4 border shadow-sm rounded-xl bg-card md:p-6">
      <div className="space-y-1">
        <CheckoutStepHeading step={4} title="Payment" />
        <div className="flex items-center gap-1 my-4 text-xs text-muted-foreground">
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
            const isWhatsApp = val === "whatsapp";
            const isGatewaySelected = val.startsWith("gateway:");
            const gatewayProvider = isGatewaySelected
              ? (val.split(":")[1] ?? "")
              : "";

            return (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={val}
                    onValueChange={field.onChange}
                    className="space-y-3"
                  >
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
                          value={value}
                          selected={selected}
                          title={title}
                          description={description}
                          icon={<GatewayIcon provider={g.provider} />}
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
                          value="bank"
                          selected={isBank}
                          title="Bank transfer"
                          description="Transfer directly to our bank account"
                          icon={<FaUniversity className="w-5 h-5" />}
                        />

                        {isBank && bankDetails && (
                          <Card className="border-primary/30">
                            <CardContent className="p-4 space-y-3">
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

                              <p className="text-sm text-red-500">
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

                    {/* WhatsApp */}
                    {whatsapp ? (
                      <div className="space-y-2">
                        <MethodCard
                          value="whatsapp"
                          selected={isWhatsApp}
                          title="WhatsApp"
                          description="Order via WhatsApp — pay directly with the seller"
                          icon={
                            <FaWhatsapp
                              className="w-8 h-8"
                              style={{ color: "#25d366" }}
                            />
                          }
                        />

                        {isWhatsApp && (
                          <Card className="border-primary/30">
                            <CardContent className="p-4 space-y-3">
                              <p className="text-sm font-semibold">
                                Your details
                              </p>
                              <p className="text-xs text-muted-foreground">
                                We&apos;ll create your order and open WhatsApp
                                so you can confirm with the seller.
                              </p>

                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field: nameField }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">
                                        First name
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...nameField}
                                          value={nameField.value ?? ""}
                                          placeholder="First name"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="lastName"
                                  render={({ field: nameField }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">
                                        Last name
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...nameField}
                                          value={nameField.value ?? ""}
                                          placeholder="Last name"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field: phoneField }) => {
                                  const phoneVal = String(
                                    phoneField.value ?? "",
                                  );
                                  const showInvalid =
                                    phoneVal.trim().length > 0 &&
                                    !isValidPhoneNumber(phoneVal, "NG");

                                  return (
                                    <FormItem>
                                      <FormLabel className="text-xs">
                                        Phone number
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...phoneField}
                                          value={phoneVal}
                                          placeholder="e.g. 0803 123 4567"
                                        />
                                      </FormControl>
                                      {showInvalid ? (
                                        <p className="text-xs text-destructive">
                                          Enter a valid Nigerian phone number.
                                        </p>
                                      ) : (
                                        <FormMessage />
                                      )}
                                    </FormItem>
                                  );
                                }}
                              />
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : null}

                    {/* Cash */}
                    {cash ? (
                      <MethodCard
                        value="cash"
                        selected={isCash}
                        title="Cash"
                        description={
                          cash.note ?? "Pay with cash on delivery/pickup."
                        }
                        icon={<MdAttachMoney className="w-6 h-6" />}
                      />
                    ) : null}

                    {/* invalid */}
                    {val && !isValidPaymentValue(val) ? (
                      <div className="text-xs text-muted-foreground">
                        Selected payment method is unavailable. Please choose
                        another.
                      </div>
                    ) : null}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            );
          }}
        />
      )}

      {!canProceedToPayment && (
        <p className="text-xs font-medium text-destructive">
          Select a shipping option or pickup point above to continue.
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base font-bold"
        isLoading={isSubmitting}
        disabled={!canPayNow || isSubmitting}
      >
        {submitLabel}
      </Button>
    </section>
  );
}
