"use server";

import { listProducts } from "./products";

export async function searchProductsQuickAction(q: string) {
  const search = q.trim();
  if (!search) return [];
  return listProducts({ search, limit: 6, offset: 0 });
}
