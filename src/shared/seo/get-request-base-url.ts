"use server";

import { headers } from "next/headers";

export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();

  const host = h.get("x-forwarded-host") ?? h.get("host");

  const proto = h.get("x-forwarded-proto") ?? "https";

  if (!host) {
    // Hard fallback – should never happen in production
    return "";
  }

  return `${proto}://${host}`;
}
