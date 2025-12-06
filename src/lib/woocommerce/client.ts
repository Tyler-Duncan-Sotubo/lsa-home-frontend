// src/lib/woocommerce/client.ts

const WC_API_URL = process.env.WC_API_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_API_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
  throw new Error("WooCommerce env vars are missing");
}

// Generic WooCommerce fetch helper (server-side only)
export async function wcFetch<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    params?: Record<string, string | number | boolean | undefined>;
    data?: unknown;
  } = {}
): Promise<T> {
  const { method = "GET", params, data } = options;

  const url = new URL(`${WC_API_URL}${endpoint}`);

  // Query params (per_page, page, product, etc.)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // Auth via query params (OK over HTTPS)
  url.searchParams.set("consumer_key", WC_CONSUMER_KEY!);
  url.searchParams.set("consumer_secret", WC_CONSUMER_SECRET!);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body:
      method === "GET" || method === "DELETE"
        ? undefined
        : JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("WooCommerce API error", res.status, text);
    throw new Error(`WooCommerce request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
