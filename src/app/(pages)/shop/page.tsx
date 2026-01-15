import { listProducts } from "@/features/Products/actions/products";
import { ShopPageClient } from "@/features/Shop/ui/shop-page-client";

export default async function ShopPage() {
  const limit = 24;
  const initialProducts = await listProducts({ limit, offset: 0 });

  return <ShopPageClient initialProducts={initialProducts} pageSize={limit} />;
}
