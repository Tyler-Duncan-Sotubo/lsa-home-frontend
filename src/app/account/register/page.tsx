"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import Link from "next/link";
import { Checkbox } from "@/shared/ui/checkbox";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  marketingOptIn: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Unable to create your account.");
        return;
      }

      // Auto-login (email-based)
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (loginRes?.error) {
        // fallback: go to login page if auto-login fails
        router.push("/account/login");
        return;
      }

      router.push(callbackUrl);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 bg-linear-to-b from-background to-muted/60">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left: Create account form */}
        <div className="px-6 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Join us
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Save your details, track orders and unlock member-only rewards.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="given-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="family-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{ required: "Password is required", minLength: 6 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>

                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Subscribe to marketing emails
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Get early access to launches, special offers, and
                        member-only promotions. You can unsubscribe anytime.
                      </p>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMsg && (
                <p className="text-sm text-emerald-600">{successMsg}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                loadingText="Creating account..."
              >
                Create account
              </Button>

              <p className="pt-2 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/account/login"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Sign in instead.
                </Link>
              </p>
            </form>
          </Form>
        </div>

        {/* Right: Premium / marketing side */}
        <div className="hidden flex-col justify-between bg-linear-to-br from-primary/90 via-primary to-primary/80 px-8 py-8 text-primary-foreground md:flex">
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase">
              Member benefits
            </p>
            <h2 className="text-2xl font-semibold leading-tight">
              More than just an account.
            </h2>
            <p className="text-sm text-primary-foreground/80">
              Become a member and get early access to launches, tailored
              recommendations and a faster checkout experience.
            </p>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                •
              </span>
              <div>
                <p className="font-medium">Track every order</p>
                <p className="text-xs text-primary-foreground/80">
                  View your full order history and live delivery updates in one
                  place.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                •
              </span>
              <div>
                <p className="font-medium">Build your wishlist</p>
                <p className="text-xs text-primary-foreground/80">
                  Save favourites to come back to later—across all your devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                •
              </span>
              <div>
                <p className="font-medium">Exclusive rewards</p>
                <p className="text-xs text-primary-foreground/80">
                  Earn points as you shop and redeem them for member-only perks.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-primary-foreground/70">
            Join thousands of members who already enjoy a better way to shop.
          </p>
        </div>
      </div>
    </div>
  );
}
