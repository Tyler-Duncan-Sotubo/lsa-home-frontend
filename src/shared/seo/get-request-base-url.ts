"use server";

import { headers } from "next/headers";

function firstForwardedHost(value: string) {
  // "a.com, b.com" -> "a.com"
  return value.split(",")[0].trim();
}

function stripPort(host: string) {
  // "example.com:443" -> "example.com"
  return host.replace(/:\d+$/, "");
}

function isBlockedHost(host: string) {
  const blockedSuffixes = ["railway.app", "vercel.app", "netlify.app"];
  return blockedSuffixes.some((s) => host === s || host.endsWith(`.${s}`));
}

export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();

  const rawHost = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0].trim();

  if (!rawHost) return "";

  const host = stripPort(firstForwardedHost(rawHost));

  // Prevent canonical/JSON-LD leaking to infra domains
  if (isBlockedHost(host)) {
    return "";
  }

  return `${proto}://${host}`;
}
