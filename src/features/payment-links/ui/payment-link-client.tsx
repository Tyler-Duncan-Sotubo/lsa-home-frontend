"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/lib/utils";
import { HiLockClosed } from "react-icons/hi";
import { FiAlertCircle, FiCopy, FiCheck } from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";
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

type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string | null;
};

type ApiMethod =
  | { method: "gateway"; provider: string }
  | { method: "bank_transfer"; bankDetails: BankDetails | null }
  | { method: "cash"; note?: string }
  | { method: "whatsapp"; available: true };

type Props = {
  link: PaymentLink;
  token: string;
  config: StorefrontConfigV1;
};

// Same logos checkout uses for gateway options, so /pay reads as the same
// product rather than a bolted-on secondary flow.
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
      <div className="relative w-20 h-8">
        <Image src={src} alt={`${provider} logo`} fill className="object-contain" />
      </div>
    );
  }
  return <FaCreditCard className="w-6 h-6" />;
}

function TitleCase(s: string) {
  return (s ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Full-width option row, LinkPay-style: radio + icon inline, no separate
// description line, generous click target, selected state is a soft
// primary ring rather than a filled background.
function MethodOption(props: {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  title: string;
  icon: React.ReactNode;
}) {
  const { value, selected, onSelect, title, icon } = props;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition",
        selected
          ? "border-primary ring-1 ring-primary bg-primary/[0.03]"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary" : "border-muted-foreground/40",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span className="text-sm font-medium flex-1">{title}</span>
      {icon}
    </button>
  );
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

function formatAmount(amountMinor: number, currency: string) {
  const major = amountMinor / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}

export function PaymentLinkClient({ link, token, config }: Props) {
  const router = useRouter();
  const storeName = config?.store?.name ?? "";
  const whatsappAgent = config?.footer?.whatsapp?.enabled
    ? config.footer.whatsapp.agents?.[0]
    : undefined;

  const [methods, setMethods] = useState<ApiMethod[] | null>(null);
  const [selected, setSelected] = useState<string>("");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);

  const [bankPayment, setBankPayment] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);

  const gateways = useMemo(
    () =>
      (methods ?? []).filter(
        (m): m is Extract<ApiMethod, { method: "gateway" }> =>
          m.method === "gateway",
      ),
    [methods],
  );
  const bankTransfer = useMemo(
    () =>
      (methods ?? []).find(
        (m): m is Extract<ApiMethod, { method: "bank_transfer" }> =>
          m.method === "bank_transfer",
      ),
    [methods],
  );
  const bankDetails = bankTransfer?.bankDetails ?? null;

  useEffect(() => {
    fetchJson(`/api/pay/${token}/methods`)
      .then((res) => {
        const list: ApiMethod[] = res?.methods ?? [];
        setMethods(list);

        const firstGateway = list.find(
          (m): m is Extract<ApiMethod, { method: "gateway" }> =>
            m.method === "gateway",
        );
        const hasBank = list.some((m) => m.method === "bank_transfer");

        if (firstGateway) {
          setSelected(`gateway:${firstGateway.provider}`);
        } else if (hasBank) {
          setSelected("bank");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bank details");
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (selected === "bank" && !bankPayment && !bankLoading) {
      handleStartBankTransfer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const isBank = selected === "bank";
  const noMethodsAvailable = methods !== null && methods.length === 0;
  const expiresAt = link.expiresAt ? new Date(link.expiresAt) : null;

  return (
    <div className="min-h-[80vh] bg-muted/30 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-start">
          {/* Left panel: method selection + active form */}
          <div className="rounded-2xl border bg-card p-6 md:p-8">
            <h1 className="text-xl font-bold mb-6">Select your payment method</h1>

            {noMethodsAvailable && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <FiAlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  This store hasn&apos;t set up a way to accept payment yet.
                  Please contact {storeName || "the store"} directly.
                </p>
              </div>
            )}

            {methods && methods.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-2.5">
                  {gateways.map((g) => {
                    const value = `gateway:${g.provider}`;
                    return (
                      <MethodOption
                        key={value}
                        value={value}
                        selected={selected === value}
                        onSelect={setSelected}
                        title={TitleCase(g.provider)}
                        icon={<GatewayIcon provider={g.provider} />}
                      />
                    );
                  })}

                  {bankTransfer && (
                    <MethodOption
                      value="bank"
                      selected={isBank}
                      onSelect={setSelected}
                      title="Bank transfer"
                      icon={<RiBankFill className="w-6 h-6 text-muted-foreground" />}
                    />
                  )}
                </div>

                {/* Active method's form/detail, shown below the option list */}
                {selected.startsWith("gateway:") && (
                  <form onSubmit={handlePay} className="space-y-4 pt-2">
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

                {isBank && (
                  <div className="space-y-4 pt-2">
                    {bankLoading && !bankDetails && (
                      <p className="text-sm text-muted-foreground">
                        Loading bank details…
                      </p>
                    )}

                    {bankDetails && (
                      <div className="space-y-3">
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
                      </div>
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
            )}
          </div>

          {/* Right panel: order summary + due/CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              {/* Gradient header band */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/70 px-6 py-6 text-primary-foreground">
                <h2 className="text-lg font-bold">Payment Request</h2>
                <p className="text-xs opacity-80 mt-0.5">
                  Please confirm the details before paying.
                </p>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Details
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Item</span>
                      <span className="font-medium text-right">{link.title}</span>
                    </div>
                    {link.description && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-medium text-right">
                          {link.description}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono text-xs text-right">
                        {link.reference}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed" />

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {formatAmount(link.amountMinor, link.currency)}
                  </p>
                </div>
              </div>
            </div>

            {expiresAt && (
              <div className="rounded-2xl border bg-card px-6 py-5 text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                  Please complete the payment before
                </p>
                <p className="text-sm font-semibold">
                  {expiresAt.toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
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
            className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <BsWhatsapp className="h-3.5 w-3.5 text-[#25D366]" />
            <span>Questions about this request? Message {storeName}</span>
          </a>
        )}
      </div>
    </div>
  );
}
