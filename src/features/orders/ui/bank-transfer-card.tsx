"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { FiCopy, FiCheck } from "react-icons/fi";
import { FaUniversity } from "react-icons/fa";
import { cn } from "@/lib/utils";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard can fail in some contexts
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

export type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  note?: string;
};

export function BankTransferCard({
  details,
  title = "Bank transfer",
  onConfirmTransfer,
  className,
}: {
  details: BankDetails;
  title?: string;
  onConfirmTransfer?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("border-primary/30", className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <FaUniversity className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">
              Transfer directly to our bank account
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold">Bank account details</p>

        <CopyRow label="Bank" value={details.bankName} />
        <CopyRow label="Account name" value={details.accountName} />
        <CopyRow label="Account number" value={details.accountNumber} />

        {details.note ? (
          <p className="text-xs text-muted-foreground">{details.note}</p>
        ) : null}

        {onConfirmTransfer ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-10"
              onClick={onConfirmTransfer}
            >
              I’ve sent the transfer
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
