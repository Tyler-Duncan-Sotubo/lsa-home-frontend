import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { buildMetadata } from "@/shared/seo/build-metadata";
import { getRequestBaseUrl } from "@/shared/seo/get-request-base-url";
import { FaArrowLeft, FaMagnifyingGlass, FaStore } from "react-icons/fa6";
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
              The link may be incorrect, or the page may have been moved or
              removed from {storeName}. Try searching below or use the links to
              keep exploring.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <FaStore className="h-4 w-4" />
                Continue browsing
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-105">
            {/* Even though the component is named ProductSearchPanel, keep the UI copy generic */}
            <ProductSearchPanel
              // If your component supports props like title/placeholder, set them here.
              // Otherwise, leaving it as-is still works; the page copy stays generic.
              // @ts-expect-error - only if your component doesn’t accept these props
              title="Search"
              placeholder="Search items…"
            />
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          Tip: Check the URL spelling, or return to{" "}
          <Link href="/" className="underline underline-offset-4">
            the homepage
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
