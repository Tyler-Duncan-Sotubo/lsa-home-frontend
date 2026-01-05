import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import LoginClient from "@/features/Pages/Account/login/ui/login-client";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.account?.pages?.login?.seo,
  });
}

export default async function LoginPage() {
  const config = await getStorefrontConfig();

  const loginConfig = config.pages?.account?.pages?.login;

  if (!loginConfig) return null;

  return <LoginClient config={loginConfig} />;
}
