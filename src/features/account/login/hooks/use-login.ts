"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginApi } from "../api/login-api";

export function useLogin(callbackUrl: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);

    const data = await loginApi.customLogin({ email, password });

    if ("error" in data) {
      setError(data.error);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      customer: JSON.stringify(data.customer),
      tokens: JSON.stringify(data.tokens),
    });

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    // ✅ Claim / merge guest cart into customer cart (best-effort)
    try {
      await fetch("/api/cart/claim", { method: "POST" });
    } catch {
      // ignore: don't block login
    }

    router.push(callbackUrl);
  };

  return { login, error };
}
