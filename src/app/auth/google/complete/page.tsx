"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function CompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = params.get("code");
    const nextRaw = params.get("next") ?? "/";
    const next =
      nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

    if (!code) {
      setError("Missing sign-in code");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/google/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Sign-in failed");
          return;
        }

        const signed = await signIn("credentials", {
          redirect: false,
          customer: JSON.stringify(data.customer),
          tokens: JSON.stringify(data.tokens),
        });

        if (signed?.error) {
          setError("Sign-in failed — please try again");
          return;
        }

        // merge any guest cart, same as password login (best-effort)
        try {
          await fetch("/api/cart/claim", { method: "POST" });
        } catch {
          // ignore
        }

        router.replace(next);
        router.refresh();
      } catch {
        setError("Sign-in failed — please try again");
      }
    })();
  }, [params, router]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <p className="text-sm text-red-600">{error}</p>
          <Link href="/login" className="text-sm underline underline-offset-2">
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      )}
    </main>
  );
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </main>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}
