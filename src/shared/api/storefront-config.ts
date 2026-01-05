import "server-only";

export function getStorefrontConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const apiKey = process.env.STOREFRONT_API_KEY;

  if (!baseUrl) {
    throw new Error(
      "Missing STOREFRONT_API_BASE_URL / NEXT_PUBLIC_BACKEND_URL"
    );
  }

  if (!apiKey) {
    throw new Error("Missing STOREFRONT_API_KEY");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
  };
}
