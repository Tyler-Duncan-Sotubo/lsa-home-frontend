"use client";

import { useAppSelector } from "@/store/hooks";
import { selectWishlistItems } from "@/store/wishlistSlice";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function WishlistPage() {
  const items = useAppSelector(selectWishlistItems);

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
        <div className="flex text-sm md:text-base">
          <div className="flex flex-wrap">
            <Link href="/account/login" className="cursor-pointer underline">
              Sign in
            </Link>
            <p className="ml-1">
              to view your wishlist across all your devices or
            </p>
          </div>
          <Link
            href="/account/register"
            className="ml-2 cursor-pointer underline"
          >
            Create an account.
          </Link>
        </div>
      </div>

      {items.length > 0 && (
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
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="flex justify-center items-center flex-col mt-24 text-center">
          <h3 className="text-3xl md:text-5xl font-semibold my-2">
            Don&apos;t sleep on your favorites
          </h3>
          <p className="max-w-md text-sm md:text-base text-muted-foreground mb-4">
            Shop your favorite sheets, robes, and more. Your body will thank
            you.
          </p>
          <Button variant="outline" asChild>
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
