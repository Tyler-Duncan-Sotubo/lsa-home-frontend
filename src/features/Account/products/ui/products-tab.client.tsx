"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { usePriceDisplay } from "@/shared/hooks/use-price-display";
import { IoChevronForward } from "react-icons/io5";
import { ListCustomerProductsResponse } from "../types/my-products";

export default function ProductsTabClient({
  initialData,
}: {
  initialData: ListCustomerProductsResponse;
}) {
  const products = initialData?.items ?? [];
  const formatPrice = usePriceDisplay();

  if (!products.length) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Your Products</h1>
        <p className="text-sm text-muted-foreground">
          You haven&apos;t purchased any products yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6  mb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/account">
          <Button variant="link" className="p-0">
            Your Account
          </Button>
        </Link>
        <IoChevronForward />
        <p>Your Products</p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Your Products</h1>
        <p className="text-sm text-muted-foreground">
          Products you&apos;ve purchased before.
        </p>
      </div>

      {/* Product list */}
      <div className="space-y-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex gap-4 rounded-lg border bg-background p-4 sm:p-5"
          >
            {/* Image */}
            {p.imageUrl && (
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name ?? "Product image"}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <Link
                href={`/products/${p.slug}`}
                className="text-sm font-medium leading-snug hover:underline"
              >
                {p.name}
              </Link>

              {p.lastOrderedAt && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Last ordered {new Date(p.lastOrderedAt).toLocaleDateString()}
                </div>
              )}

              {/* Price */}
              {(p.minPriceMinor != null || p.maxPriceMinor != null) && (
                <div className="mt-2 text-sm font-semibold">
                  {p.minPriceMinor != null && p.maxPriceMinor != null
                    ? `${formatPrice(
                        String(p.minPriceMinor / 100)
                      )} – ${formatPrice(String(p.maxPriceMinor / 100))}`
                    : formatPrice(
                        String(
                          ((p.minPriceMinor ?? p.maxPriceMinor) as number) / 100
                        )
                      )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link href={`/products/${p.slug}`}>
                <Button size="sm" variant="clean">
                  View product
                </Button>
              </Link>

              <Link href={`/products/${p.slug}`}>
                <Button size="sm" variant="clean">
                  Order again
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
