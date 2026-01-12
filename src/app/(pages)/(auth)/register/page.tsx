import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import type { Metadata } from "next";
import { buildMetadata } from "@/shared/seo/build-metadata";
import RegisterClient from "@/features/Account/register/ui/register-client";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildMetadata({
    globalSeo: config.seo,
    pageSeo: config.pages?.account?.pages?.register?.seo,
  });
}

export default async function RegisterPage() {
  const config = await getStorefrontConfig();

  const registerConfig = config.pages?.account?.pages?.register;
  if (!registerConfig) return null;

  return <RegisterClient config={registerConfig} />;
}
