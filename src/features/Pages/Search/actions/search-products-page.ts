/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { listProducts } from "../../Products/actions/products";

export async function searchProductsPageAction(
  q: string,
  page = 1,
  perPage = 24
) {
  const search = q.trim();
  if (!search) {
    return {
      items: [],
      page,
      perPage,
      total: 0,
      hasNext: false,
      hasPrev: false,
    };
  }

  const safePage = Math.max(1, page);
  const limit = perPage;
  const offset = (safePage - 1) * perPage;

  // If listProducts can return total, use it. If not, we’ll still paginate via hasNext heuristic.
  const res: any = await listProducts({ search, limit, offset });

  const items = Array.isArray(res) ? res : res?.items ?? [];
  const total = typeof res?.total === "number" ? res.total : 0;

  const hasPrev = safePage > 1;
  const hasNext = total
    ? offset + items.length < total
    : items.length === limit;

  return { items, page: safePage, perPage, total, hasNext, hasPrev };
}
