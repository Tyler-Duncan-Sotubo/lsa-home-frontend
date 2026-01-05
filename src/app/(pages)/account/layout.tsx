// app/account/layout.tsx
import * as React from "react";
import { auth } from "@/lib/auth/auth";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { AccountClient } from "@/features/Pages/Account/core/ui/account-client";
import { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.account?.pages?.account?.seo,
  });
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const config = await getStorefrontConfig();

  if (!session) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">You are not logged in</h2>
        <p className="text-muted-foreground mt-2">
          Please sign in to access your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <AccountClient config={config.pages?.account?.pages?.account}>
        {children}
      </AccountClient>
    </div>
  );
}
