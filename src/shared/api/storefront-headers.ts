"use server";

import { headers } from "next/headers";

export async function getStoreHostHeader() {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-host");
    const host = h.get("host");
    console.log("[getStoreHostHeader]", {
      forwarded,
      host,
      using: forwarded ?? host,
    });
    const resolved = forwarded ?? host ?? "";
    return resolved ? { "X-Store-Host": resolved } : {};
  } catch {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      return host ? { "X-Store-Host": host } : {};
    }
    return {};
  }
}
