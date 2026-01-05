import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import LoadingComp from "@/shared/ui/loading/loading";

export default async function Loading() {
  const config = await getStorefrontConfig();

  return (
    <LoadingComp
      logoUrl={config.theme?.assets?.logoUrl}
      storeName={config.store?.name}
    />
  );
}
