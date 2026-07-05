import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";

export type LoyaltySettings = {
  enabled: boolean;
  earnRate: number;
  earnAmount: number;
  pointValueMinor: number;
  minRedemptionPoints: number;
} | null;

export type LoyaltyBalance = {
  points: number;
  lifetimeEarned: number;
  valueMinor: number;
  valueMajor: number;
};

export type LoyaltyLedgerEntry = {
  id: string;
  points: number;
  type: "earn" | "redeem" | "adjust";
  referenceId: string | null;
  referenceType: string | null;
  note: string | null;
  createdAt: string;
};

async function callStorefront<T>(
  path: string,
  accessToken?: string | null,
): Promise<T> {
  const res = await storefrontFetchSafe<T>(path, {
    method: "GET",
    tags: ["customer:loyalty"],
    accessToken: accessToken ?? null,
  });

  if (!res.ok) {
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }

  return res.data;
}

export function getLoyaltySettings(accessToken?: string | null) {
  return callStorefront<LoyaltySettings>(
    "/api/storefront/customers/loyalty/settings",
    accessToken,
  );
}

export function getLoyaltyBalance(accessToken?: string | null) {
  return callStorefront<LoyaltyBalance>(
    "/api/storefront/customers/loyalty/balance",
    accessToken,
  );
}

export function getLoyaltyLedger(
  opts?: { limit?: number; offset?: number },
  accessToken?: string | null,
) {
  const qs = new URLSearchParams();
  if (opts?.limit != null) qs.set("limit", String(opts.limit));
  if (opts?.offset != null) qs.set("offset", String(opts.offset));

  const url = `/api/storefront/customers/loyalty/ledger${
    qs.toString() ? `?${qs}` : ""
  }`;

  return callStorefront<LoyaltyLedgerEntry[]>(url, accessToken);
}
