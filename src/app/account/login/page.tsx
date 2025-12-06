"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

type LoginFormValues = {
  username: string; // not email
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      username: values.username,
      password: values.password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }
    router.push(callbackUrl);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 bg-linear-to-b from-background to-muted/60">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: Sign in form */}
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                rules={{ required: "Username or email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input type="text" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/account/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full">
                Sign in
              </Button>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/account/register"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Create one in seconds.
                </Link>
              </p>
            </form>
          </Form>
        </div>

        {/* Right: Premium / marketing side */}
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
