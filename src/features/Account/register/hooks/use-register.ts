/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAccount, type RegisterPayload } from "../api/register";

export function useRegister(callbackUrl: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(
    async (values: RegisterPayload) => {
      setError(null);

      try {
        const data = await registerAccount(values);

        // Auto-login (credentials) — the provider's authorize() expects the
        // customer + tokens payload we already have, not email/password.
        const loginRes = await signIn("credentials", {
          redirect: false,
          customer: JSON.stringify(data.customer),
          tokens: JSON.stringify(data.tokens),
        });

        if (loginRes?.error) {
          router.push("/login");
          return;
        }

        // ✅ Claim / merge guest cart into the new customer's cart (best-effort)
        try {
          await fetch("/api/cart/claim", { method: "POST" });
        } catch {
          // ignore: don't block registration
        }

        router.push(callbackUrl);
      } catch (e: any) {
        setError(e?.message || "Something went wrong. Please try again.");
      }
    },
    [callbackUrl, router],
  );

  return { register, error, setError };
}
