import { listCustomerProducts } from "@/features/Account/products/actions/products";
import ProductsTabClient from "@/features/Account/products/ui/products-tab.client";
import { auth } from "@/lib/auth/auth";

export default async function AccountProductsPage() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;
  const data = await listCustomerProducts({ limit: 20, offset: 0 }, token);

  return <ProductsTabClient initialData={data} />;
}
