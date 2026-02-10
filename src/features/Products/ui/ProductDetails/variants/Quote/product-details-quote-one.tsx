/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Rating } from "../../../../../reviews/ui/rating";
import { VariantSelectors } from "../../../ProductInfo/variant-selectors";
import { WishlistButton } from "../../../ProductInfo/wishlist-button";
import type { Product } from "@/features/Products/types/products";
import { Button } from "@/shared/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToQuote } from "@/store/quoteSlice";
import { useCanSeePrice } from "@/shared/hooks/use-can-see-price";
import { useMoney } from "@/shared/hooks/use-money";
import { ProductInfoSections } from "../../../ProductInfo/product-info-sections";
import { useLinkedProductsQuery } from "../../../../hooks/use-upsell-products";
import { LINK_COPY } from "@/shared/constants/link-copy";
import { LinkedProducts } from "../../../ProductInfo/linked-products";
import { gaEvent } from "@/features/integrations/config/ga";

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

/**
 * ✅ Admin preset list (UI knows these “official” option names)
 * Keep the values EXACTLY how admin sets them (case-insensitive match still works).
 */
const OPTION_PRESETS = [
  { value: "Color", label: "Color" },
  { value: "Size", label: "Size" },
  { value: "Material", label: "Material" },
  { value: "Style", label: "Style" },
  { value: "Type", label: "Type" },
] as const;

type PresetName = (typeof OPTION_PRESETS)[number]["value"];

export interface ProductDetailsTwoProps {
  product: Product;
  selectedColor?: string | null;
  onSelectColor?: (color: string) => void;
  isModal?: boolean;
  onAddedToCart?: () => void;
  showInfoSections?: boolean;
}

export function ProductDetailsQuoteOne({
  product,
  selectedColor,
  onSelectColor,
  isModal,
  onAddedToCart,
  showInfoSections,
}: ProductDetailsTwoProps) {
  const dispatch = useAppDispatch();
  const { canSee, rule, isLoggedIn, priceRange } = useCanSeePrice();
  const formatMoney = useMoney();
  const showWishListButton = useAppSelector(
    (s) => s.runtimeConfig.ui.product.showWishlistButton,
  );

  const pricePrefix = priceRange ? "From " : "";

  const [quantity, setQuantity] = useState(1);

  // Keep existing size/color model
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // ✅ New: extra selections (Material/Style/Type etc.)
  const [selectedExtras, setSelectedExtras] = useState<
    Partial<Record<PresetName, string | null>>
  >({});

  /**
   * ✅ Split product.attributes into:
   * - colorAttributes, sizeAttributes (existing VariantSelectors needs them)
   * - presetExtrasAttributes (Material/Style/Type etc), ONLY if present
   */
  const {
    colorAttributes,
    sizeAttributes,
    presetExtrasAttributes, // map: "Material" | "Style" | "Type" -> attribute
  } = useMemo(() => {
    const attrs = product?.attributes ?? [];

    const byPreset = new Map<PresetName, any[]>();
    for (const p of OPTION_PRESETS) byPreset.set(p.value, []);

    for (const a of attrs as any[]) {
      const name = String(a?.name ?? "");
      const hit = OPTION_PRESETS.find(
        (p) =>
          norm(p.value) === norm(name) || norm(name).includes(norm(p.value)),
      );
      if (hit) {
        byPreset.get(hit.value)!.push(a);
      }
    }

    const color = byPreset.get("Color") ?? [];
    const size = byPreset.get("Size") ?? [];

    const extras: Partial<Record<PresetName, any>> = {};
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color" || p.value === "Size") continue;
      const list = byPreset.get(p.value) ?? [];
      if (list.length) extras[p.value] = list[0]; // take first matching attribute
    }

    return {
      colorAttributes: color,
      sizeAttributes: size,
      presetExtrasAttributes: extras,
    };
  }, [product]);

  const rating = Number(product.average_rating ?? 0);
  const reviews = product.rating_count ?? 0;

  // Defaults (keeps existing behavior)
  const firstSize = sizeAttributes[0]?.options?.[0] ?? null;
  const firstColor = colorAttributes[0]?.options?.[0] ?? null;

  const effectiveSize = selectedSize ?? firstSize;
  const effectiveColor = selectedColor ?? firstColor ?? null;

  /**
   * ✅ Default extras to first option when present
   */
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

  /**
   * ✅ Build a stable selection key using OPTION_PRESETS order.
   * This ensures index + lookup always agree.
   */
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
      // extras
      parts.push(norm(selectedExtras[p.value] ?? null));
    }

    return parts.join("|");
  }, [effectiveColor, effectiveSize, selectedExtras]);

  /**
   * ✅ Index variations by the same preset-based key.
   * (Supports size-only, color-only, or combinations with Material/Style/Type)
   */
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

      const keyParts = OPTION_PRESETS.map((p) => getOpt(p.value));
      const key = keyParts.join("|");

      map.set(key, v);
    }

    return map;
  }, [product.variations]);

  const activeVariation = useMemo(() => {
    return (
      variationIndex.get(selectionKey) ??
      (product.variations?.[0] as any) ??
      null
    );
  }, [variationIndex, selectionKey, product.variations]);

  const isInStock = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    if (vAny?.stock_status) return vAny.stock_status === "instock";
    if (pAny?.stock_status) return pAny.stock_status === "instock";
    return true;
  }, [activeVariation, product]);

  const isPriceEligible = useMemo(() => {
    if (!activeVariation) return false;
    if (!isInStock) return false;
    return true;
  }, [activeVariation, isInStock]);

  const variationImageSrc = useMemo(() => {
    const hero = product.images?.[0]?.src ?? null;
    if (!activeVariation) return hero;

    const av: any = activeVariation;
    const singleImageSrc = av.image?.src ?? av.image?.url ?? null;
    const galleryImageSrc = av.images?.[0]?.src ?? av.images?.[0]?.url ?? null;

    return singleImageSrc ?? galleryImageSrc ?? hero;
  }, [activeVariation, product.images]);

  const handleSelectColor = (c: string) => onSelectColor?.(c);

  const buildAttributes = (): Record<string, string | null> => {
    const out: Record<string, string | null> = {};

    if (effectiveSize) out["Size"] = effectiveSize;
    if (effectiveColor) out["Color"] = effectiveColor;

    // include extras
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color" || p.value === "Size") continue;
      const v = selectedExtras[p.value];
      if (v) out[p.value] = v;
    }

    // include variation attributes too (source of truth)
    const attrs = (activeVariation as any)?.attributes ?? [];
    for (const a of attrs) {
      const key = a?.name ? String(a.name) : null;
      const val = a?.option ? String(a.option) : null;
      if (key) out[key] = val;
    }

    return out;
  };

  const buildVariantLabel = () => {
    const parts: string[] = [];
    if (effectiveSize) parts.push(`Size: ${effectiveSize}`);
    if (effectiveColor) parts.push(`Color: ${effectiveColor}`);

    for (const p of OPTION_PRESETS) {
      if (p.value === "Color" || p.value === "Size") continue;
      const v = selectedExtras[p.value];
      if (v) parts.push(`${p.value}: ${v}`);
    }

    return parts.length ? parts.join(" · ") : undefined;
  };

  const { regularPrice, salePrice, onSale } = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;

    const vRegular = vAny?.regular_price ?? null;
    const vSale = vAny?.sale_price ?? null;
    const vPrice = vAny?.price ?? null;
    const vOnSale = vAny?.on_sale ?? false;

    const pRegular = pAny?.regular_price ?? null;
    const pSale = pAny?.sale_price ?? null;
    const pPrice = pAny?.price ?? null;
    const pOnSale = pAny?.on_sale ?? false;

    const finalRegular = vRegular || vPrice || pRegular || pPrice || null;
    const finalSale = vSale || pSale || null;

    const regN = Number(finalRegular ?? 0);
    const saleN = Number(finalSale ?? 0);
    const finalOnSale =
      (vOnSale || pOnSale) && saleN > 0 && regN > 0 && saleN < regN;

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

  const discountPercent = useMemo(() => {
    if (!onSale) return null;
    const reg = Number(regularPrice ?? 0);
    const sale = Number(salePrice ?? 0);
    if (!reg || !sale || sale >= reg) return null;
    return Math.round(((reg - sale) / reg) * 100);
  }, [onSale, regularPrice, salePrice]);

  const handleRequestQuote = () => {
    dispatch(
      addToQuote({
        slug: product.slug,
        productId: String((product as any)?.id),
        variantId: (activeVariation as any)?.id
          ? String((activeVariation as any).id)
          : null,
        quantity,
        name: product.name,
        moq: product.moq,
        variantLabel: buildVariantLabel(),
        image: variationImageSrc ?? null,
        attributes: buildAttributes(),
        price: activeVariation
          ? (activeVariation as any)?.price
            ? Number((activeVariation as any).price)
            : null
          : null,
      }),
    );

    gaEvent("add_to_cart", {
      currency: "NGN",
      value: (Number(product.price) || 0) * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: selectedColor ?? undefined,
          price: product.price ?? 0,
          quantity: quantity,
        },
      ],
    });

    onAddedToCart?.();
  };

  const { data: crossSells = [], isLoading: crossSellsLoading } =
    useLinkedProductsQuery(product.id, "cross_sell", true);
  const copy = LINK_COPY["cross_sell"];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      <header className="text-left mb-3">
        <h1 className="text-lg md:text-2xl font-semibold">{product.name}</h1>

        <div
          className="my-2 text-xs md:text-sm text-muted-foreground prose prose-sm
             prose-p:mt-0 prose-p:mb-2"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {!isModal ? null : (
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

        {/* ================= PRICE BLOCK ================= */}
        {canSee ? (
          isPriceEligible ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                {formattedSale && formattedRegular ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm md:text-base line-through text-muted-foreground">
                      {formattedRegular}
                    </span>

                    <span className="text-base md:text-lg font-semibold text-primary">
                      {pricePrefix}
                      {formattedSale}
                    </span>

                    {discountPercent && (
                      <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                ) : formattedRegular ? (
                  <span className="text-base md:text-lg font-semibold">
                    {pricePrefix}
                    {formattedRegular}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              </div>

              <div className="flex flex-col">
                <p className="text-sm font-semibold text-destructive">
                  Out of stock
                </p>
                <p className="text-xs text-muted-foreground">
                  This option isn’t available right now. Try another option.
                </p>
              </div>
            </div>
          )
        ) : isPriceEligible ? (
          <div className="rounded-lg py-2">
            {rule === "loggedInOnly" && !isLoggedIn ? (
              <p className="mt-1 text-base text-muted-foreground">
                <Link href="/account/login" className="underline font-medium">
                  Login
                </Link>
                <span className="mt-1"> to see pricing.</span>
              </p>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground">Pricing</p>
                <p className="text-xs text-muted-foreground">
                  Pricing is provided via quote based on your selections and
                  quantity.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* ✅ Keep existing size/color selectors */}
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

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRequestQuote}
              className="flex-1"
              type="button"
            >
              Request Quote
            </Button>

            {showWishListButton && (
              <WishlistButton
                item={{
                  id: (product as any).id,
                  slug: product.slug,
                  name: product.name,
                  regularPrice: null,
                  salePrice: null,
                  onSale: false,
                  image: variationImageSrc,
                  rating,
                  reviews,
                  priceHtml: product.price_html,
                }}
              />
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-muted/60 px-3 py-2">
            <div className="mt-0.75 h-6 w-6 rounded-full bg-primary/10" />
            <div className="space-y-1">
              <p className="text-xs font-medium">
                Need help choosing the right option?
              </p>
              <p className="text-[11px] text-muted-foreground">
                Send a quote request and our team will get back to you.
              </p>
            </div>
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
    </div>
  );
}
