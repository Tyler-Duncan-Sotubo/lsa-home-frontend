"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { HiLockClosed } from "react-icons/hi";
import { FiAlertCircle } from "react-icons/fi";

type PaymentLink = {
  id: string;
  token: string;
  title: string;
  description?: string | null;
  currency: string;
  amountMinor: number;
  status: "active" | "inactive";
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
};

type Props = {
  link: PaymentLink;
  token: string;
};

function formatAmount(amountMinor: number, currency: string) {
  const major = amountMinor / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}

export function PaymentLinkClient({ link, token }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/pay/${token}/success`
          : undefined;

      const res = await fetch(`/api/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), callbackUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message ?? "Failed to initialize payment");
        return;
      }

      const authorizationUrl =
        json?.data?.authorizationUrl ?? json?.authorizationUrl;

      if (!authorizationUrl) {
        setError("Payment provider did not return a checkout URL");
        return;
      }

      window.location.href = authorizationUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <p className="text-xs font-medium uppercase tracking-widest opacity-70 mb-1">
              Payment Request
            </p>
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

          {/* Form */}
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
              {loading ? "Redirecting…" : `Pay ${formatAmount(link.amountMinor, link.currency)}`}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <HiLockClosed className="h-3 w-3" />
              <span>Secured by Paystack · SSL encrypted</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
