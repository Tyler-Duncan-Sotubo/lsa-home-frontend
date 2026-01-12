export type CustomerProductPreview = {
  id: string;
  name: string | null;
  slug: string | null;

  imageUrl: string | null;

  // pricing (pick what you actually have available)
  minPriceMinor?: number | null; // if you have price aggregates
  maxPriceMinor?: number | null;

  // useful UX
  lastOrderedAt?: string | null; // ISO
  lastOrderId?: string | null;
  lastOrderNumber?: string | null;
};

export type ListCustomerProductsResponse = {
  items: CustomerProductPreview[];
  total: number;
  limit: number;
  offset: number;
};
