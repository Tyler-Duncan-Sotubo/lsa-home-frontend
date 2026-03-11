/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type InitializePaystackPayload = {
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  channels?: string[];
};

export type InitializePaystackResponse = {
  authorizationUrl: string | null;
  accessCode: string | null;
  reference: string;
};

export async function initializeStorefrontPaystack(
  payload: InitializePaystackPayload,
) {
  const res = await storefrontFetchSafe<InitializePaystackResponse>(
    `/api/payments/paystack/public/initialize`,
    {
      method: "POST",
      body: payload,
    },
  );

  if (!res.ok) {
    return {
      ok: false as const,
      error: "Unable to initialize payment",
    };
  }

  return {
    ok: true as const,
    data: res.data,
  };
}

export type VerifyPaystackResponse = {
  provider: "paystack";
  verified: boolean;
  reference: string;
  status: string | null;
  amount: number | null;
  currency: string | null;
  paidAt: string | null;
  channel: string | null;
  gatewayResponse: string | null;
};

export async function verifyStorefrontPaystack(reference: string) {
  const res = await storefrontFetchSafe<VerifyPaystackResponse>(
    `/api/payments/paystack/public/verify/${reference}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    return {
      ok: false as const,
      error: "Unable to verify payment",
    };
  }

  return {
    ok: true as const,
    data: res.data,
  };
}
