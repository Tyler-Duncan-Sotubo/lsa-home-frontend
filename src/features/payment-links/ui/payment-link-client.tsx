"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent } from "@/shared/ui/card";
import { HiLockClosed } from "react-icons/hi";
import { FiAlertCircle, FiCopy, FiCheck } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";
import { usePaystackCheckout } from "@/features/checkout/hooks/use-paystack-checkout";
import { UploadPaymentEvidenceModal } from "@/features/orders/ui/upload-payment-evidence-modal";
import type { StorefrontConfigV1 } from "@/config/types/types";

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...init });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? res.statusText);
  }
  return data;
}

type PaymentLink = {
  id: string;
  token: string;
  reference: string;
  title: string;
  description?: string | null;
  currency: string;
  amountMinor: number;
  status: "active" | "inactive";
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
};

type ApiMethod =
  | { method: "gateway"; provider: string }
  | {
      method: "bank_transfer";
      bankDetails: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        instructions?: string | null;
      } | null;
    }
  | { method: "cash"; note?: string }
  | { method: "whatsapp"; available: true };

type Props = {
  link: PaymentLink;
  token: string;
  config: StorefrontConfigV1;
};

function formatAmount(amountMinor: number, currency: string) {
  const major = amountMinor / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
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
        {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
      </button>
    </div>
  );
}

export function PaymentLinkClient({ link, token, config }: Props) {
  const router = useRouter();
  const logoUrl = config?.theme?.assets?.logoUrl;
  const storeName = config?.store?.name ?? "";
  const whatsappAgent = config?.footer?.whatsapp?.enabled
    ? config.footer.whatsapp.agents?.[0]
    : undefined;

  const [methods, setMethods] = useState<ApiMethod[] | null>(null);
  const [selected, setSelected] = useState<"gateway" | "bank_transfer" | null>(
    null,
  );

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const [bankPayment, setBankPayment] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [bankDetails, setBankDetails] = useState<{
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions?: string | null;
  } | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);

  useEffect(() => {
    fetchJson(`/api/pay/${token}/methods`)
      .then((res) => {
        const list: ApiMethod[] = res?.methods ?? [];
        setMethods(list);
        const gatewayFirst = list.find((m) => m.method === "gateway");
        const bankOnly = list.find((m) => m.method === "bank_transfer");
        // Default: skip the selector when only one method is offered —
        // same UX principle as checkout.
        if (list.length === 1) {
          setSelected(list[0].method === "gateway" ? "gateway" : "bank_transfer");
        } else if (gatewayFirst) {
          setSelected("gateway");
        } else if (bankOnly) {
          setSelected("bank_transfer");
        }
      })
      .catch(() => setMethods([]));
  }, [token]);

  // Same reference-trust pattern as checkout's usePaystackCheckout: the
  // popup's onSuccess callback returns Paystack's own internal reference,
  // not ours — verify against the reference we already know from
  // initialize() instead of whatever the popup hands back.
  const { resumeCheckout } = usePaystackCheckout(async (reference: string) => {
    const res = await fetchJson(
      `/api/pay/${token}/verify?reference=${encodeURIComponent(reference)}`,
    );
    if (!res?.verified) {
      throw new Error("Payment not verified yet");
    }
    return res;
  });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setPendingConfirmation(false);

    try {
      const res = await fetch(`/api/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message ?? "Failed to initialize payment");
        setLoading(false);
        return;
      }

      const accessCode = json?.data?.accessCode ?? json?.accessCode;
      const reference = json?.data?.reference ?? json?.reference;

      if (!accessCode) {
        setError("Payment provider did not return a checkout code");
        setLoading(false);
        return;
      }

      await resumeCheckout(accessCode, reference, {
        onSuccess: () => {
          router.push(
            `/pay/${token}/success?reference=${encodeURIComponent(reference)}`,
          );
        },
        onPendingConfirmation: () => {
          setPendingConfirmation(true);
        },
        onCancel: () => {
          setLoading(false);
        },
        onError: (message) => {
          setError(message);
          setLoading(false);
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleStartBankTransfer = async () => {
    setBankLoading(true);
    setError(null);
    try {
      const res = await fetchJson(`/api/pay/${token}/bank-transfer`, {
        method: "POST",
      });
      setBankPayment(res.payment);
      setBankDetails(res.bankDetails);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bank details");
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (selected === "bank_transfer" && !bankPayment && !bankLoading) {
      handleStartBankTransfer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const showSelector = (methods?.length ?? 0) > 1;
  const hasGateway = methods?.some((m) => m.method === "gateway");
  const hasBank = methods?.some((m) => m.method === "bank_transfer");
  const noMethodsAvailable = methods !== null && methods.length === 0;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      {/* Store identity — confirms who's actually asking for money */}
      <div className="flex flex-col items-center gap-2">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={storeName}
            width={120}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        ) : (
          <span className="text-lg font-semibold">{storeName}</span>
        )}
        {storeName && (
          <p className="text-xs text-muted-foreground">
            Payment request from {storeName}
          </p>
        )}
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                Payment Request
              </p>
              <span className="text-[11px] font-mono opacity-60">
                {link.reference}
              </span>
            </div>
            <h1 className="text-xl font-bold leading-snug">{link.title}</h1>
            {link.description && (
              <p className="text-sm mt-1 opacity-80">{link.description}</p>
            )}
          </div>

          {/* Amount */}
          <div className="px-6 py-5 border-b">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Amount
            </p>
            <p className="text-3xl font-bold tabular-nums">
              {formatAmount(link.amountMinor, link.currency)}
            </p>
          </div>

          {noMethodsAvailable && (
            <div className="px-6 py-5">
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <FiAlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  This store hasn&apos;t set up a way to accept payment yet.
                  Please contact {storeName || "the store"} directly.
                </p>
              </div>
            </div>
          )}

          {showSelector && (hasGateway || hasBank) && (
            <div className="px-6 pt-5 grid grid-cols-2 gap-2">
              {hasGateway && (
                <button
                  type="button"
                  onClick={() => setSelected("gateway")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    selected === "gateway"
                      ? "border-primary ring-1 ring-primary bg-primary/5"
                      : "hover:border-muted-foreground/30"
                  }`}
                >
                  Pay online
                </button>
              )}
              {hasBank && (
                <button
                  type="button"
                  onClick={() => setSelected("bank_transfer")}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    selected === "bank_transfer"
                      ? "border-primary ring-1 ring-primary bg-primary/5"
                      : "hover:border-muted-foreground/30"
                  }`}
                >
                  Bank transfer
                </button>
              )}
            </div>
          )}

          {/* Gateway form */}
          {selected === "gateway" && (
            <form onSubmit={handlePay} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Your email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  A payment receipt will be sent to this address.
                </p>
              </div>

              {pendingConfirmation && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2.5">
                  <FiAlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Still confirming your payment — this can take a few
                    minutes for bank transfers.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <FiAlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !email.trim()}
              >
                {loading
                  ? "Processing…"
                  : `Pay ${formatAmount(link.amountMinor, link.currency)}`}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <HiLockClosed className="h-3 w-3" />
                <span>Secured by Paystack · SSL encrypted</span>
              </div>
            </form>
          )}

          {/* Bank transfer view */}
          {selected === "bank_transfer" && (
            <div className="px-6 py-5 space-y-4">
              {bankLoading && !bankDetails && (
                <p className="text-sm text-muted-foreground">
                  Loading bank details…
                </p>
              )}

              {bankDetails && (
                <Card className="border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold">
                      Bank account details
                    </p>
                    <CopyRow label="Bank" value={bankDetails.bankName} />
                    <CopyRow
                      label="Account name"
                      value={bankDetails.accountName}
                    />
                    <CopyRow
                      label="Account number"
                      value={bankDetails.accountNumber}
                    />
                    {bankDetails.instructions && (
                      <p className="text-xs text-muted-foreground">
                        {bankDetails.instructions}
                      </p>
                    )}
                    <p className="text-sm text-amber-600">
                      Proof of payment will be required to confirm this
                      payment.
                    </p>
                  </CardContent>
                </Card>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <FiAlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {bankPayment && (
                <>
                  {evidenceUploaded ? (
                    <div className="rounded-xl border p-3 text-sm">
                      <p className="font-medium">Proof submitted</p>
                      <p className="text-xs text-muted-foreground">
                        We&apos;ve received your proof of payment.
                        Verification is in progress — you&apos;ll get a
                        confirmation once it&apos;s reviewed.
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      onClick={() => setUploadOpen(true)}
                    >
                      I&apos;ve made this transfer
                    </Button>
                  )}

                  <UploadPaymentEvidenceModal
                    open={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                    paymentId={bankPayment.id}
                    onUploaded={() => setEvidenceUploaded(true)}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {whatsappAgent?.phone && (
          <a
            href={`https://wa.me/${whatsappAgent.phone.replace(/[^0-9]/g, "")}${
              whatsappAgent.prefill
                ? `?text=${encodeURIComponent(whatsappAgent.prefill)}`
                : `?text=${encodeURIComponent(
                    `Hi, I have a question about payment request ${link.reference}`,
                  )}`
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <BsWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
            <span>Questions about this request? Message {storeName}</span>
          </a>
        )}
      </div>
    </div>
  );
}
