// src/lib/storefront/account/profile.ts
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";
import type {
  CustomerProfile,
  UpdateCustomerProfileDto,
} from "../types/profile";

export async function getCustomerProfile(accessToken?: string | null) {
  const res = await storefrontFetchSafe<CustomerProfile>(
    "/api/storefront/customers",
    { tags: ["customer:profile"], accessToken: accessToken ?? null }
  );

  if (!res.ok) {
    console.error("getCustomerProfile failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return null;
  }

  return res.data;
}

export async function updateCustomerProfile(
  dto: UpdateCustomerProfileDto,
  accessToken?: string | null
) {
  const res = await storefrontFetchSafe<CustomerProfile>(
    "/api/storefront/customers",
    {
      method: "PATCH",
      body: dto,
      tags: ["customer:profile"],
      accessToken: accessToken ?? null,
    }
  );

  if (!res.ok) {
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }

  return res.data;
}

export async function updateCustomerPassword(
  input: {
    currentPassword: string;
    newPassword: string;
  },
  accessToken?: string | null
) {
  const res = await storefrontFetchSafe<{ ok: true }>(
    "/api/storefront/customers/password",
    {
      method: "PATCH",
      body: input,
      accessToken: accessToken ?? null,
    }
  );

  if (!res.ok) {
    throw {
      statusCode: res.statusCode,
      error: res.error,
    };
  }
  return res.data;
}
