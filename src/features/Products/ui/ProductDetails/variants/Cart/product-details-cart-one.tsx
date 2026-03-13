/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Rating } from "../../../../../reviews/ui/rating";
import { VariantSelectors } from "../../../ProductInfo/variant-selectors";
import { WishlistButton } from "../../../ProductInfo/wishlist-button";
import { AddToCartButton } from "../../../../../cart/add-to-cart-button";
import type { Product } from "@/features/Products/types/products";
import { ProductInfoSections } from "../../../ProductInfo/product-info-sections";
import { useMoney } from "@/shared/hooks/use-money";
import { LinkedProducts } from "../../../ProductInfo/linked-products";
import { useLinkedProductsQuery } from "@/features/Products/hooks/use-upsell-products";
import { LINK_COPY } from "@/shared/constants/link-copy";
import { SereneAddToCartSection } from "../../serene-add-to-cart-section";

export interface ProductDetailsPanelProps {
  product: Product;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void;
  isModal?: boolean;
  onAddedToCart?: () => void;
  showInfoSections?: boolean;
  /** Pass siteName so Serene-specific hybrid logic can activate */
  siteName?: string;
}

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

/**
 * ✅ Preset list (admin-defined "known" option names)
 */
const OPTION_PRESETS = [
  { value: "Color", label: "Color" },
  { value: "Size", label: "Size" },
  { value: "Material", label: "Material" },
  { value: "Style", label: "Style" },
  { value: "Type", label: "Type" },
] as const;

type PresetName = (typeof OPTION_PRESETS)[number]["value"];

export function ProductDetailsCartOne({
  product,
  selectedColor,
  onSelectColor,
  isModal,
  onAddedToCart,
  showInfoSections = true,
  siteName,
}: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [selectedExtras, setSelectedExtras] = useState<
    Partial<Record<PresetName, string | null>>
  >({});

  const formatMoney = useMoney();

  /** Only Serene gets the hybrid pre-order/quote flow */
  const isSerene = norm(siteName) === "serene";

  const { colorAttributes, sizeAttributes, presetExtrasAttributes } =
    useMemo(() => {
      const attrs = (product?.attributes ?? []) as any[];

      const byPreset = new Map<PresetName, any[]>();
      for (const p of OPTION_PRESETS) byPreset.set(p.value, []);

      for (const a of attrs) {
        const name = String(a?.name ?? "");
        const hit = OPTION_PRESETS.find(
          (p) =>
            norm(p.value) === norm(name) || norm(name).includes(norm(p.value)),
        );
        if (hit) byPreset.get(hit.value)!.push(a);
      }

      const color = byPreset.get("Color") ?? [];
      const size = byPreset.get("Size") ?? [];

      const extras: Partial<Record<PresetName, any>> = {};
      for (const p of OPTION_PRESETS) {
        if (p.value === "Color" || p.value === "Size") continue;
        const list = byPreset.get(p.value) ?? [];
        if (list.length) extras[p.value] = list[0];
      }

      return {
        colorAttributes: color,
        sizeAttributes: size,
        presetExtrasAttributes: extras,
      };
    }, [product]);

  const rating = Number(product.average_rating ?? 0);
  const reviews = product.rating_count ?? 0;

  const firstSize = sizeAttributes[0]?.options?.[0] ?? null;
  const firstColor = colorAttributes[0]?.options?.[0] ?? null;

  const effectiveSize = selectedSize ?? firstSize;
  const effectiveColor = selectedColor ?? firstColor ?? null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedExtras((prev) => {
      const next = { ...prev };
      (["Material", "Style", "Type"] as PresetName[]).forEach((k) => {
        const attr = presetExtrasAttributes[k] as any | undefined;
        const first = attr?.options?.[0] ?? null;
        if (attr && next[k] == null) next[k] = first;
      });
      return next;
    });
  }, [presetExtrasAttributes]);

  const selectionKey = useMemo(() => {
    const parts: string[] = [];
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color") {
        parts.push(norm(effectiveColor));
        continue;
      }
      if (p.value === "Size") {
        parts.push(norm(effectiveSize));
        continue;
      }
      parts.push(norm(selectedExtras[p.value] ?? null));
    }
    return parts.join("|");
  }, [effectiveColor, effectiveSize, selectedExtras]);

  const variationIndex = useMemo(() => {
    const vars = (product.variations ?? []) as any[];
    const map = new Map<string, any>();

    for (const v of vars) {
      const attrs: any[] = v?.attributes ?? [];
      const getOpt = (preset: PresetName) => {
        const found = attrs.find((a) => {
          const n = norm(a?.name);
          return n === norm(preset) || n.includes(norm(preset));
        });
        return norm(found?.option ?? null);
      };
      map.set(OPTION_PRESETS.map((p) => getOpt(p.value)).join("|"), v);
    }

    return map;
  }, [product.variations]);

  const activeVariation = useMemo(() => {
    const variations = product.variations ?? [];
    if (variations.length === 0) return null;
    return variationIndex.get(selectionKey) ?? variations[0] ?? null;
  }, [variationIndex, selectionKey, product.variations]);

  const maxQty = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;
    if (vAny?.manage_stock) return Number(vAny.stock_quantity ?? 0);
    if (pAny?.manage_stock) return Number(pAny.stock_quantity ?? 0);
    return 10;
  }, [activeVariation, product]);

  const isInStock = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;
    if (vAny?.manage_stock) return Number(vAny.stock_quantity ?? 0) > 0;
    if (pAny?.manage_stock) return Number(pAny.stock_quantity ?? 0) > 0;
    if (vAny?.stock_status) return vAny.stock_status === "instock";
    if (pAny?.stock_status) return pAny.stock_status === "instock";
    return true;
  }, [activeVariation, product]);

  // Non-Serene: clamp qty to stock cap as before
  useEffect(() => {
    if (isSerene) return; // Serene manages its own qty — no clamping
    const cap = Math.min(10, Math.max(1, maxQty || 0));
    if (!isInStock || cap <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity(1);
      return;
    }
    setQuantity((q) => Math.min(Math.max(1, q), cap));
  }, [maxQty, isInStock, activeVariation?.id, isSerene]);

  const canAddToCart =
    isInStock && quantity <= Math.min(10, Math.max(1, maxQty || 0));

  const variationImageSrc = useMemo(() => {
    const hero = product.images?.[0]?.src ?? null;
    if (!activeVariation) return hero;
    const av: any = activeVariation;
    return (
      av.image?.src ??
      av.image?.url ??
      av.images?.[0]?.src ??
      av.images?.[0]?.url ??
      hero
    );
  }, [activeVariation, product.images]);

  const { regularPrice, salePrice, onSale } = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    const finalRegular =
      vAny?.regular_price ||
      vAny?.price ||
      pAny?.regular_price ||
      pAny?.price ||
      null;
    const finalSale = vAny?.sale_price || pAny?.sale_price || null;
    const finalOnSale = (vAny?.on_sale || pAny?.on_sale) ?? false;

    return {
      regularPrice: finalRegular,
      salePrice: finalSale,
      onSale: finalOnSale,
    };
  }, [activeVariation, product]);

  const formattedRegular =
    regularPrice != null ? formatMoney(Number(regularPrice)) : null;
  const formattedSale =
    salePrice != null ? formatMoney(Number(salePrice)) : null;

  const handleSelectColor = (c: string) => onSelectColor?.(c);

  const { data: crossSells = [], isLoading: crossSellsLoading } =
    useLinkedProductsQuery(product.id, "cross_sell", true);
  const copy = LINK_COPY["cross_sell"];

  // Non-Serene qty cap (unchanged behaviour)
  const qtyOptionsCount = Math.min(10, Math.max(1, maxQty || 0));

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <header className="text-left mb-3">
        <h1 className="text-lg md:text-2xl font-semibold">{product.name}</h1>
        <div
          className="my-2 text-xs md:text-sm text-muted-foreground prose prose-sm prose-p:mt-0 prose-p:mb-2"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        {isModal && (
          <div className="mt-4 text-xs md:text-sm text-muted-foreground">
            <span>Get All The Details.</span>
            <Link
              href={`/products/${product.slug}`}
              className="font-semibold underline ml-1"
            >
              View Full Page
            </Link>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-4 pb-6">
        <Rating rating={rating} reviews={reviews} />

        <VariantSelectors
          colorAttributes={colorAttributes}
          sizeAttributes={sizeAttributes}
          extraAttributes={presetExtrasAttributes}
          selectedColor={effectiveColor}
          selectedSize={effectiveSize}
          selectedExtras={selectedExtras}
          onSelectExtra={(name, opt) =>
            setSelectedExtras((p) => ({ ...p, [name]: opt }))
          }
          onSelectColor={handleSelectColor}
          onSelectSize={setSelectedSize}
          variations={product.variations}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {onSale && formattedSale && formattedRegular ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm md:text-base line-through text-muted-foreground">
                  {formattedRegular}
                </span>
                <span className="text-base md:text-lg font-semibold text-primary">
                  {formattedSale}
                </span>
              </div>
            ) : formattedRegular ? (
              <span className="text-base md:text-lg font-semibold">
                {formattedRegular}
              </span>
            ) : (
              <span className="text-base md:text-lg font-semibold">
                Price unavailable
              </span>
            )}
          </div>
        </div>

        {/* ✅ Serene: hybrid Add to Cart / Pre-order section */}
        {isSerene ? (
          <SereneAddToCartSection
            product={product}
            activeVariation={activeVariation}
            quantity={quantity}
            setQuantity={setQuantity}
            maxQty={maxQty}
            isInStock={isInStock}
            regularPrice={regularPrice}
            salePrice={salePrice}
            onSale={onSale}
            variationImageSrc={variationImageSrc}
            effectiveColor={effectiveColor}
            effectiveSize={effectiveSize}
            selectedExtras={selectedExtras}
            onAddedToCart={onAddedToCart}
          />
        ) : (
          /* ✅ All other stores: existing behaviour, untouched */
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AddToCartButton
                slug={product.slug}
                quantity={quantity}
                onAddedToCart={onAddedToCart}
                disabled={!canAddToCart}
                variantId={activeVariation?.id as unknown as string}
                name={product.name}
                image={variationImageSrc}
                unitPrice={Number(salePrice ?? regularPrice ?? 0)}
                maxQty={maxQty}
              />

              <div className="relative">
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={qtyOptionsCount}
                    value={quantity}
                    disabled={!isInStock}
                    onChange={(e) => {
                      const val = Math.min(
                        qtyOptionsCount,
                        Math.max(1, Number(e.target.value) || 1),
                      );
                      setQuantity(val);
                    }}
                    className="h-10 w-20 rounded-md border bg-background px-3 text-xs font-medium"
                  />
                </div>
              </div>

              <WishlistButton
                item={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  regularPrice,
                  salePrice,
                  onSale,
                  image: variationImageSrc,
                }}
              />
            </div>

            {!isInStock ? (
              <p className="text-xs text-destructive mt-1">
                This variant is currently out of stock.
              </p>
            ) : maxQty > 0 && maxQty <= 10 ? (
              <p className="text-[11px] text-muted-foreground mt-1">
                Only {maxQty} left
              </p>
            ) : null}

            <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-3 py-2">
              <div className="mt-0.75 h-6 w-6 rounded-full bg-primary/10" />
              <div className="space-y-1">
                <p className="text-xs font-medium">
                  Join Rewards to earn points on this purchase!
                </p>
                <p className="text-[11px] text-muted-foreground">
                  <Link href="/register" className="underline">
                    Sign up
                  </Link>{" "}
                  or{" "}
                  <Link href="/login" className="underline">
                    sign in
                  </Link>{" "}
                  today.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex md:hidden">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Get all the details.{" "}
            <span className="font-semibold underline">View full page</span>
          </Link>
        </div>
      </div>

      {showInfoSections && !isModal ? (
        <ProductInfoSections product={product} />
      ) : null}

      <LinkedProducts
        products={crossSells}
        loading={crossSellsLoading}
        title={copy.title}
        subtitle={copy.subtitle}
      />
    </div>
  );
}
