/* eslint-disable react-hooks/set-state-in-effect */
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
  const [quantity, setQuantity] = useState<string>("1");

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<
    Partial<Record<PresetName, string | null>>
  >({});

  const { colorAttributes, sizeAttributes, presetExtrasAttributes } =
    useMemo(() => {
      const attrs = product?.attributes ?? [];
      const byPreset = new Map<PresetName, any[]>();
      for (const p of OPTION_PRESETS) byPreset.set(p.value, []);

      for (const a of attrs as any[]) {
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

  // Default extras to first option
  useEffect(() => {
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

  const activeVariation = useMemo(
    () =>
      variationIndex.get(selectionKey) ??
      (product.variations?.[0] as any) ??
      null,
    [variationIndex, selectionKey, product.variations],
  );

  // ─── Stock state of the active variation ─────────────────────────────────
  const activeVariationStock: "in" | "low" | "out" = useMemo(() => {
    const v = activeVariation as any | null;
    const p = product as any;

    const status = v?.stock_status ?? p?.stock_status ?? "instock";

    if (status === "outofstock") return "out";

    const qty = v?.manage_stock
      ? Number(v.stock_quantity ?? 0)
      : p?.manage_stock
        ? Number(p.stock_quantity ?? 0)
        : null;

    if (qty !== null && qty === 0) return "out";
    if (qty !== null && qty <= 3) return "low";

    return "in";
  }, [activeVariation, product]);

  const isInStock = activeVariationStock !== "out";

  const maxQty = useMemo(() => {
    const vAny = activeVariation as any | null;
    const pAny = product as any;
    if (vAny?.manage_stock) return Number(vAny.stock_quantity ?? 0);
    if (pAny?.manage_stock) return Number(pAny.stock_quantity ?? 0);
    return 10;
  }, [activeVariation, product]);

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

  const buildAttributes = (): Record<string, string | null> => {
    const out: Record<string, string | null> = {};
    if (effectiveSize) out["Size"] = effectiveSize;
    if (effectiveColor) out["Color"] = effectiveColor;
    for (const p of OPTION_PRESETS) {
      if (p.value === "Color" || p.value === "Size") continue;
      const v = selectedExtras[p.value];
      if (v) out[p.value] = v;
    }
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

    const finalRegular =
      vAny?.regular_price ??
      vAny?.price ??
      pAny?.regular_price ??
      pAny?.price ??
      null;
    const finalSale = vAny?.sale_price ?? pAny?.sale_price ?? null;

    const regN = Number(finalRegular ?? 0);
    const saleN = Number(finalSale ?? 0);

    // ✅ sale is only valid if sale price is a positive number AND less than regular
    const finalOnSale =
      (vAny?.on_sale || pAny?.on_sale) &&
      saleN > 0 && // ← this was already there but finalSale "0" still passed
      regN > 0 &&
      saleN < regN &&
      finalSale != null &&
      String(finalSale).trim() !== "" &&
      String(finalSale).trim() !== "0"; // ✅ explicit zero string guard

    return {
      regularPrice: finalRegular,
      // ✅ nullify sale price if it's not genuinely on sale
      salePrice: finalOnSale ? finalSale : null,
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

  const qtyNum = Math.max(1, Number(quantity) || 1);

  const handleRequestQuote = () => {
    dispatch(
      addToQuote({
        slug: product.slug,
        productId: String((product as any)?.id),
        variantId: (activeVariation as any)?.id
          ? String((activeVariation as any).id)
          : null,
        quantity: qtyNum,
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
      value: (Number(product.price) || 0) * qtyNum,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_variant: selectedColor ?? undefined,
          price: product.price ?? 0,
          quantity: qtyNum,
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
          className="my-2 text-sm md:text-base text-muted-foreground prose prose-sm prose-p:mt-0 prose-p:mb-2"
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

        {/* Price block */}
        {canSee && (formattedSale || formattedRegular) && (
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
        )}

        {/* Stock / preorder banner — driven by activeVariationStock */}
        {activeVariationStock === "out" && (
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-primary">Preorder</p>
              <p className="text-xs text-muted-foreground">
                This variant is available for preorder.
              </p>
            </div>
          </div>
        )}

        {activeVariationStock === "low" && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-amber-700">Low Stock</p>
              <p className="text-xs text-amber-600">
                Only {maxQty} left — order soon.
              </p>
            </div>
          </div>
        )}

        {/* Login / quote pricing notice */}
        {!canSee && (
          <div className="rounded-lg py-2">
            {rule === "loggedInOnly" && !isLoggedIn ? (
              <p className="mt-1 text-base text-muted-foreground">
                <Link href="/login" className="underline font-medium">
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
        )}

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
          onSelectColor={(c) => onSelectColor?.(c)}
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
              {isInStock ? "Request Quote" : "Preorder / Request Quote"}
            </Button>

            {/* ✅ Qty input */}
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={(e) => {
                const val = Math.max(1, Number(e.target.value) || 1);
                setQuantity(String(val));
              }}
              className="h-10 w-20 rounded-md border bg-background px-3 text-xs font-medium"
            />

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
            <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 shrink-0" />
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

        {showInfoSections && !isModal && (
          <ProductInfoSections product={product} />
        )}

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
