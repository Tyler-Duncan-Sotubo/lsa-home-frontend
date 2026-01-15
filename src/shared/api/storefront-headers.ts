"use server";

import { headers } from "next/headers";

export async function getStoreHostHeader() {
  // Server
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    return host ? { "X-Store-Host": host } : {};
  } catch {
    // Client
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      return host ? { "X-Store-Host": host } : {};
    }
    return {};
  }
}
