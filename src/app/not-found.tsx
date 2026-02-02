import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getRequestBaseUrl } from "@/shared/seo/get-request-base-url";
import {
  FaArrowLeft,
  FaMagnifyingGlass,
  FaStore,
  FaCircleQuestion,
  FaEnvelope,
  FaHouse,
} from "react-icons/fa6";
import { ProductSearchPanel } from "@/features/Products/ui/ProductSearch/product-search-panel";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const storeName = config.store?.name ?? "Store";

  const baseUrl = await getRequestBaseUrl();
  const canonical = baseUrl ? `${baseUrl}/404` : "/404";

  const base = buildMetadata({
    globalSeo: config.seo,
    pageSeo: {
      title: `Page not found | ${storeName}`,
      description:
        "The page you’re looking for may have been moved or removed.",
    },
  });

  return {
    ...base,
    robots: { index: false, follow: true },
    alternates: { canonical },
  };
}

export default async function NotFound() {
  const config = await getStorefrontConfig();
  const storeName = config.store?.name ?? "Store";

  return (
    <section className="mx-auto w-[95%] py-14 md:py-20">
      <div className="rounded-2xl border bg-background p-6 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Left */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <FaMagnifyingGlass className="h-3.5 w-3.5" />
              404 Page not found
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              We couldn’t find that page
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              It may have been renamed, moved, or removed from {storeName}. Use
              one of the site links below, or search products on the right.
            </p>

            {/* Primary actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <FaHouse className="h-4 w-4" />
                Home
              </Link>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <FaStore className="h-4 w-4" />
                Browse Products
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>

            {/* Site-wide shortcuts */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/help"
                className="rounded-xl border bg-background p-4 transition hover:bg-muted"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FaCircleQuestion className="h-4 w-4" />
                  Help Center
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Shipping, returns, FAQs, and support articles.
                </p>
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border bg-background p-4 transition hover:bg-muted"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FaEnvelope className="h-4 w-4" />
                  Contact Us
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Need a hand? Send us a message.
                </p>
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-105">
            <div className="rounded-2xl border bg-muted/30 p-4 md:p-6">
              <div className="mb-4">
                <div className="text-sm font-semibold">Search products</div>
                <div className="text-xs text-muted-foreground">
                  Looking for something to buy? Try product search.
                </div>
              </div>

              <ProductSearchPanel />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          Tip: Check the URL spelling, or navigate via{" "}
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>{" "}
          and{" "}
          <Link href="/shop" className="underline underline-offset-4">
            Products
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
