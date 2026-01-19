"use client";

import { useState } from "react";
import { UploadPaymentEvidenceModal } from "./upload-payment-evidence-modal";

type PaymentInfo = {
  id: string;
  status?: string | null;
  evidenceCount?: number | null;
  lastEvidenceUrl?: string | null;
};

export function BankTransferEvidenceSection({
  payment,
  onUploaded,
}: {
  payment: PaymentInfo | null;
  onUploaded?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const paymentId = payment?.id ?? null;
  const hasEvidence =
    Boolean(payment?.lastEvidenceUrl) ||
    Number(payment?.evidenceCount ?? 0) > 0;

  // You can decide your rule:
  // - If evidence exists: disable re-upload (or hide it)
  // - If payment succeeded: also disable
  const disabled =
    !paymentId ||
    hasEvidence ||
    String(payment?.status ?? "").toLowerCase() === "succeeded";

  return (
    <div className="space-y-2">
      {hasEvidence ? (
        <div className="rounded-xl border p-3 text-sm">
          <p className="font-medium">Proof submitted</p>
          <p className="text-xs text-muted-foreground">
            We’ve received your proof of payment. Verification is in progress.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        className="w-full rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {hasEvidence ? "Proof already submitted" : "Upload proof of payment"}
      </button>

      {paymentId ? (
        <UploadPaymentEvidenceModal
          open={open}
          onClose={() => setOpen(false)}
          paymentId={paymentId}
          onUploaded={onUploaded}
        />
      ) : null}
    </div>
  );
}
