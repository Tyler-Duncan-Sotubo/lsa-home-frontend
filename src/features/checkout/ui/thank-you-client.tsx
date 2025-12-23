// src/features/checkout/ui/thank-you-client.tsx
"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { useThankYou } from "../hooks/use-thank-you";

interface ThankYouClientProps {
  orderId?: string;
}

export function ThankYouClient({ orderId }: ThankYouClientProps) {
  const { hasOrderId } = useThankYou({ orderId });

  return (
    <main className="min-h-[60vh] w-[95%] max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Thank you for your order
        </h1>

        {hasOrderId ? (
          <p className="text-sm md:text-base text-muted-foreground">
            Your order number is{" "}
            <span className="font-semibold">#{orderId}</span>. We&apos;ll be in
            touch with updates about your delivery or pickup.
          </p>
        ) : (
          <p className="text-sm md:text-base text-muted-foreground">
            Your order has been placed successfully.
          </p>
        )}

        <p className="text-xs md:text-sm text-muted-foreground">
          You can view your orders anytime from your account area.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/collections/all">
            <Button variant="outline" className="px-4 py-2 font-medium">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="outline" className="px-4 py-2 font-medium">
              Go to My Account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
