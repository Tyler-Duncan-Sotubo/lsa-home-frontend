import "server-only";
import { listBestSellerProducts } from "./product-discovery";
import { getProductBySlugWithVariations } from "./products";
import type { Product } from "@/features/Products/types/products";

// Pulled out of any component body: React Compiler treats calling
// Math.random() directly inside a component/page as an impurity, even
// though this only ever runs server-side per request.
function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Picks `count` products to upsell (cart/checkout "You may also like"),
 * fetching full detail up front so the picker actually has variant data to
 * show — and guaranteeing at least one variant product makes the cut so
 * that feature isn't hidden by an unlucky random draw.
 */
export async function getUpsellProducts(count = 2): Promise<Product[]> {
  const pool = await listBestSellerProducts({ limit: 10 });

  const detailed = (
    await Promise.all(pool.map((p) => getProductBySlugWithVariations(p.slug)))
  ).filter((p): p is Product => Boolean(p));

  const withVariants = detailed.filter((p) => (p.variations?.length ?? 0) > 0);
  const simple = detailed.filter((p) => !(p.variations?.length ?? 0));

  if (!withVariants.length) {
    return pickRandom(simple, count);
  }

  const [firstPick] = pickRandom(withVariants, 1);
  const rest = pickRandom(
    detailed.filter((p) => p.id !== firstPick.id),
    count - 1,
  );

  return [firstPick, ...rest].filter(Boolean);
}
