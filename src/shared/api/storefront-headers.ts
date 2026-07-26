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
    const previewToken = h.get("x-preview-token");

    return {
      ...(resolved ? { "X-Store-Host": resolved } : {}),
      ...(previewToken ? { "X-Preview-Token": previewToken } : {}),
    };
  } catch {
    return {};
  }
}
