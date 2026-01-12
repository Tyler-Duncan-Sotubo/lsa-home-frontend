// src/lib/storefront/account/addresses.ts
import "server-only";
import { storefrontFetchSafe } from "@/shared/api/fetch";
import {
  CreateCustomerAddressDto,
  CustomerAddress,
  UpdateCustomerAddressDto,
} from "../types/address";

const BASE = "/api/storefront/customers/addresses";

export async function listCustomerAddresses(accessToken?: string | null) {
  const res = await storefrontFetchSafe<CustomerAddress[]>(BASE, {
    method: "GET",
    tags: ["customer:addresses"],
    accessToken: accessToken ?? null,
  });

  if (!res.ok) {
    console.error("listCustomerAddresses failed", {
      statusCode: res.statusCode,
      error: res.error,
    });
    return null;
  }

  return res.data;
}

export async function createCustomerAddress(
  dto: CreateCustomerAddressDto,
  accessToken?: string | null
) {
  const res = await storefrontFetchSafe<CustomerAddress>(BASE, {
    method: "POST",
    body: dto,
    tags: ["customer:addresses"],
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

export async function updateCustomerAddress(
  id: string,
  dto: UpdateCustomerAddressDto,
  accessToken?: string | null
) {
  const res = await storefrontFetchSafe<CustomerAddress>(`${BASE}/${id}`, {
    method: "PATCH",
    body: dto,
    tags: ["customer:addresses"],
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

export async function deleteCustomerAddress(
  id: string,
  accessToken?: string | null
) {
  const res = await storefrontFetchSafe<{ success: true }>(`${BASE}/${id}`, {
    method: "DELETE",
    tags: ["customer:addresses"],
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
