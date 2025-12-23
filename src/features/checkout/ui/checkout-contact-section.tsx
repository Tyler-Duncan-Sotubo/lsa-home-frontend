"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Input } from "@/shared/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import type { CheckoutFormInstance } from "@/features/checkout/types/checkout";

interface CheckoutContactSectionProps {
  form: CheckoutFormInstance;
}

export function CheckoutContactSection({ form }: CheckoutContactSectionProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userEmail = session?.user?.email ?? "";

  // If the user is logged in, keep the form's email in sync with session
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      form.setValue("email", userEmail, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [isAuthenticated, userEmail, form]);

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Contact</h2>

        {!isAuthenticated && (
          <Link
            href="/account/login"
            className="text-sm underline underline-offset-4"
          >
            Sign in
          </Link>
        )}
      </div>

      {/* If user is authenticated, show their details instead of the full form */}
      {isAuthenticated ? (
        <div className="space-y-2 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              Signed in as
            </span>
            <span className="font-medium">
              {session.user?.name ?? userEmail}
            </span>
            {userEmail && (
              <span className="text-xs text-muted-foreground">{userEmail}</span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            We&apos;ll use this email to send order updates.
          </p>

          <Link
            href="/account"
            className="text-xs underline underline-offset-4"
          >
            Manage account details
          </Link>
        </div>
      ) : (
        // Guest: show full contact form
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or mobile phone number</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketingOptIn"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Email me with news and offers
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      )}
    </section>
  );
}
