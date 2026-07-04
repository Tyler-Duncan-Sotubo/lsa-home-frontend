import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import Link from "next/link";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

type VerifyResult = {
  verified: boolean;
  reference: string;
  status: string | null;
  amount: number | null;
  currency: string | null;
  paidAt: string | null;
  channel: string | null;
  customer: { email?: string } | null;
};

async function verifyPayment(
  token: string,
  reference: string,
): Promise<VerifyResult | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/pay/${token}/verify?reference=${encodeURIComponent(reference)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PaymentLinkSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const reference = sp.reference ?? sp.trxref ?? null;

  const [config, verification] = await Promise.all([
    getStorefrontConfig(),
    reference ? verifyPayment(token, reference) : Promise.resolve(null),
  ]);

  const verified = verification?.verified === true;

  const formattedAmount =
    verification?.amount != null && verification?.currency
      ? new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: verification.currency,
          minimumFractionDigits: 2,
        }).format(verification.amount)
      : null;

  const formattedDate = verification?.paidAt
    ? new Date(verification.paidAt).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              verified ? "bg-green-100" : "bg-yellow-100"
            }`}
          >
            {verified ? (
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <FiAlertCircle className="h-8 w-8 text-yellow-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {verified ? "Payment Confirmed!" : "Payment Received"}
          </h1>
          <p className="text-muted-foreground">
            {verified
              ? "Your payment was successfully processed."
              : "Your payment is being processed. You'll receive a confirmation shortly."}
          </p>
        </div>

        {verified && (formattedAmount || verification?.customer?.email) && (
          <div className="rounded-xl border bg-muted/30 p-4 text-left space-y-2 text-sm">
            {formattedAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold tabular-nums">
                  {formattedAmount}
                </span>
              </div>
            )}
            {verification?.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs truncate max-w-[180px]">
                  {verification.reference}
                </span>
              </div>
            )}
            {verification?.customer?.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{verification.customer.email}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{formattedDate}</span>
              </div>
            )}
            {verification?.channel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="capitalize">{verification.channel}</span>
              </div>
            )}
          </div>
        )}

        {config.store?.name && (
          <Link
            href="/"
            className="inline-block text-sm text-primary underline underline-offset-4"
          >
            Continue shopping at {config.store.name}
          </Link>
        )}
      </div>
    </div>
  );
}
