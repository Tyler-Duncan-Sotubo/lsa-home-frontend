/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

type Props = {
  orderId: string;
};

export function OrderPaystackVerifier({ orderId }: Props) {
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "failed"
  >("idle");
  const hasRunRef = useRef(false);

  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref") ?? null;

  useEffect(() => {
    if (!reference) return;
    if (hasRunRef.current) return;

    hasRunRef.current = true;
    setStatus("verifying");

    const run = async () => {
      try {
        const res = await axios.get(`/api/paystack/verify/${reference}`);
        const data = res.data?.data ?? res.data;

        if (data?.verified || data?.status === "success") {
          setStatus("success");

          await qc.invalidateQueries({
            queryKey: ["storefront-order", orderId],
          });

          return;
        }

        setStatus("failed");
      } catch (err) {
        console.error("Paystack verify failed:", err);
        setStatus("failed");
      }
    };

    run();
  }, [reference, orderId, qc]);

  if (!reference) return null;

  if (status === "verifying") {
    return (
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-background to-background shadow-sm">
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Confirming your payment
              </p>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                In progress
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              We’re securely verifying your Paystack transaction and updating
              your order.
            </p>

            <div className="mt-3 overflow-hidden rounded-full bg-muted">
              <div className="h-1.5 w-1/2 animate-pulse rounded-full bg-primary" />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Please keep this page open for a moment.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="overflow-hidden rounded-2xl border border-green-200 bg-linear-to-br from-green-50 via-white to-white shadow-sm">
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-green-800">
                Payment verified successfully
              </p>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                Confirmed
              </span>
            </div>

            <p className="mt-1 text-sm text-green-700/90">
              Your payment has been confirmed and your order is being updated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 via-white to-white shadow-sm">
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-amber-800">
                We could not confirm this payment yet
              </p>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Pending review
              </span>
            </div>

            <p className="mt-1 text-sm text-amber-700/90">
              This can happen if the payment is still processing or verification
              has not completed yet.
            </p>

            <div className="mt-3 rounded-xl border border-amber-200 bg-white/70 p-3">
              <p className="text-xs font-medium text-foreground">
                What you can do next
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Refresh this page shortly, or contact support if you have
                already completed the transfer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
