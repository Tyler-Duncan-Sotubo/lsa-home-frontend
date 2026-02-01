"use server";

import { headers } from "next/headers";

export async function getSitemapBaseUrl(): Promise<string> {
  const h = await headers();

  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";

  if (!host) {
    // Absolute fallback – should basically never happen
    return "https://mycenta.com";
  }

  return `${proto}://${host}`;
}
