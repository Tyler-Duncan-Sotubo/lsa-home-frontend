// src/features/marketing-opt-in/ui/thank-you-subscribing-client.tsx
"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface ThankYouSubscribingClientProps {
  storeName?: string;
}

export function ThankYouSubscribingClient({
  storeName,
}: ThankYouSubscribingClientProps) {
  return (
    <main className="min-h-[60vh] w-[95%] max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-center">
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">
          You&apos;re subscribed
        </h1>

        <p className="text-sm md:text-base text-muted-foreground">
          Thanks for confirming — you&apos;ll now hear from{" "}
          <span className="font-semibold">{storeName ?? "us"}</span> about new
          arrivals, offers, and updates.
        </p>

        <p className="text-xs md:text-sm text-muted-foreground">
          You can unsubscribe anytime from the link at the bottom of any email
          we send.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="px-4 py-2 font-medium">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
