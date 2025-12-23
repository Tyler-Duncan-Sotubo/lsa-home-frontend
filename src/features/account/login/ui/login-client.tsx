"use client";

import { useSearchParams } from "next/navigation";
import { useLogin } from "../hooks/use-login";
import { LoginForm } from "./login-form";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const { login, error } = useLogin(callbackUrl);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 bg-linear-to-b from-background to-muted/60">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left */}
        <div className="px-6 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Welcome back
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Access your orders, wishlist and rewards in one place.
            </p>
          </div>

          <LoginForm
            error={error}
            onSubmit={(v) => login(v.email, v.password)}
          />
        </div>

        {/* Right marketing panel */}
        <div className="hidden flex-col justify-between bg-linear-to-br from-primary/90 via-primary to-primary/80 px-8 py-8 text-primary-foreground md:flex">
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase">
              Members club
            </p>
            <h2 className="text-2xl font-semibold leading-tight">
              Unlock a better way to shop.
            </h2>
            <p className="text-sm text-primary-foreground/80">
              Collect rewards on every order, save your favourites, and enjoy a
              faster checkout across all your devices.
            </p>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                1
              </span>
              <div>
                <p className="font-medium">Earn rewards as you shop</p>
                <p className="text-xs text-primary-foreground/80">
                  Every purchase turns into points you can redeem for exclusive
                  perks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                2
              </span>
              <div>
                <p className="font-medium">Wishlist that follows you</p>
                <p className="text-xs text-primary-foreground/80">
                  Save items once and access them from any device, any time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                3
              </span>
              <div>
                <p className="font-medium">Priority access & drops</p>
                <p className="text-xs text-primary-foreground/80">
                  Be the first to know about new collections, sales and limited
                  releases.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-primary-foreground/70">
            Trusted by thousands of customers who shop with us every month.
          </p>
        </div>
      </div>
    </div>
  );
}
