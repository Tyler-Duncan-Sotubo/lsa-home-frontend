import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type InitializeStripePayload = {
  amount: number;
  currency?: string;
  reference: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  productName: string;
};

export type InitializeStripeResponse = {
  checkoutUrl: string | null;
  sessionId: string | null;
  reference: string;
};

export async function initializeStorefrontStripe(
  payload: InitializeStripePayload,
) {
  const res = await storefrontFetchSafe<{
    status: boolean;
    message: string;
    data: InitializeStripeResponse;
  }>(`/api/payments/stripe/public/initialize`, {
    method: "POST",
    body: payload,
  });

  if (!res.ok) {
    return { ok: false as const, error: "Unable to initialize payment" };
  }

  return { ok: true as const, data: res.data.data };
}

export type VerifyStripeResponse = {
  provider: "stripe";
  verified: boolean;
  reference: string;
  sessionId: string;
  paymentIntentId: string | null;
  status: string;
  amount: number | null;
  currency: string | null;
  paidAt: string | null;
};

export async function verifyStorefrontStripe(sessionId: string) {
  const res = await storefrontFetchSafe<VerifyStripeResponse>(
    `/api/payments/stripe/public/verify/${sessionId}`,
    { method: "GET" },
  );

  if (!res.ok) {
    return { ok: false as const, error: "Unable to verify payment" };
  }

  return { ok: true as const, data: res.data };
}
