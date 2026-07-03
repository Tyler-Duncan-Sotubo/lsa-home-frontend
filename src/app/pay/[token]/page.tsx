import type { Metadata } from "next";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { storefrontFetchSafe } from "@/shared/api/fetch";
import { PaymentLinkClient } from "@/features/payment-links/ui/payment-link-client";
import { notFound } from "next/navigation";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const config = await getStorefrontConfig();
  const result = await storefrontFetchSafe<PaymentLink>(
    `/api/storefront/payment-links/${token}`,
  );

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: {
      title: result.ok ? result.data.title : "Pay",
      description: result.ok
        ? result.data.description ?? undefined
        : "Secure payment",
    },
  });
}

export default async function PaymentLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await storefrontFetchSafe<PaymentLink>(
    `/api/storefront/payment-links/${token}`,
  );

  if (!result.ok) {
    if (result.statusCode === 404) notFound();
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-destructive">
            This payment link is unavailable
          </p>
          <p className="text-sm text-muted-foreground">
            {(result.error as any)?.message ??
              "It may have expired or been deactivated."}
          </p>
        </div>
      </div>
    );
  }

  return <PaymentLinkClient link={result.data} token={token} />;
}
