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
        await registerAccount(values);

        // Auto-login (credentials)
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
          callbackUrl,
        });

        if (loginRes?.error) {
          router.push("/account/login");
          return;
        }

        router.push(callbackUrl);
      } catch (e: any) {
        setError(e?.message || "Something went wrong. Please try again.");
      }
    },
    [callbackUrl, router]
  );

  return { register, error, setError };
}
