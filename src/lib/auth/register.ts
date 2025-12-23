/* eslint-disable @typescript-eslint/no-explicit-any */
import { storefrontFetch } from "@/shared/api/fetch";
import "server-only";

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  marketingOptIn?: boolean;
};

export type RegisterResult =
  | {
      ok: true;
      customer: {
        id: string;
        companyId: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    }
  | { ok: false; error: string };

export async function registerCore(
  input: RegisterInput
): Promise<RegisterResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    const data = await storefrontFetch<{
      customer: any;
      tokens: any;
    }>(`/api/storefront/customers/register`, {
      method: "POST",
      body: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: normalizedEmail,
        phone: input.phone,
        password: input.password,
        marketingOptIn: input.marketingOptIn ?? false,
      },
    });

    // backend returns { customer, tokens }
    return { ok: true, ...(data as any) };
  } catch (e: any) {
    const msg =
      e?.message ??
      e?.error ??
      (typeof e === "string" ? e : null) ??
      "Registration failed";

    return { ok: false, error: msg };
  }
}
