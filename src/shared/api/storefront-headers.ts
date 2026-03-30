"use server";

import { headers } from "next/headers";

export async function getStoreHostHeader() {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-host");
    const host = h.get("host");
    const resolved = (forwarded ?? host ?? "")
      .split(":")[0]
      .trim()
      .toLowerCase();

    return resolved ? { "X-Store-Host": resolved } : {};
  } catch {
    return {};
  }
}
