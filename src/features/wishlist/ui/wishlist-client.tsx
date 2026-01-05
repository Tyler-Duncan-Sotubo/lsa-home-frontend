// src/features/wishlist/ui/wishlist-client.tsx
"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Breadcrumb } from "@/shared/seo/breadcrumb";
import { ProductCard } from "@/features/Pages/Products/ui/product-card";
import { useWishlistController } from "@/features/wishlist/hooks/use-wishlist-controller";

export function WishlistClient() {
  const { items, isAuthed, isEmpty } = useWishlistController();

  return (
    <section className="mx-auto w-[95%] py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Wishlist", href: "/wishlist" },
        ]}
      />

      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-semibold mb-6">Wishlist</h1>

        {!isAuthed ? (
          <div className="flex text-sm md:text-base">
            <div className="flex flex-wrap">
              <Link href="/login" className="cursor-pointer underline">
                Sign in
              </Link>
              <p className="ml-1">
                to view your wishlist across all your devices or
              </p>
            </div>
            <Link href="/register" className="ml-2 cursor-pointer underline">
              Create an account.
            </Link>
          </div>
        ) : (
          <div>
            <Link
              href="/account"
              className="text-sm md:text-base underline cursor-pointer"
            >
              View Account
            </Link>
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              permalink={item.slug ? `/products/${item.slug}` : undefined}
              imageSrc={item.image}
              regularPrice={item.regularPrice ?? undefined}
              salePrice={item.salePrice ?? undefined}
              onSale={item.onSale ?? false}
              priceHtml={item.priceHtml ?? undefined}
              averageRating={item.rating ?? 0}
              ratingCount={item.reviews ?? 0}
            />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="flex justify-center items-center flex-col mt-24 text-center">
          <h3 className="text-3xl md:text-5xl font-semibold my-2">
            Don&apos;t sleep on your favorites
          </h3>
          <p className="max-w-md text-sm md:text-base text-muted-foreground mb-4">
            Shop your favorite sheets, robes, and more. Your body will thank
            you.
          </p>
          <Button asChild>
            <Link href="/collections/latest">Shop Latest Collections</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
