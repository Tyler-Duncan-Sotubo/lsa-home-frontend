export type CustomerActivityOrder = {
  id: string;
  orderNumber?: string | null;
  status?: string | null;
  createdAt: string | Date;
  currency?: string | null;
  totalMinor?: number | null;
};

export type CustomerActivityProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  lastOrderedAt?: string | Date;
};

export type CustomerActivityReview = {
  id: string;
  productId: string;
  rating: number;
  review: string;
  createdAt: string | Date;
  product: {
    id: string;
    name: string | null;
    slug: string | null;
    imageUrl: string | null;
  } | null;
};

export type CustomerActivityQuote = {
  id: string;
  storeId: string;
  status: "new" | "converted" | "expired" | string;
  customerEmail: string;
  customerNote: string | null;
  expiresAt: string | Date | null;
  createdAt: string | Date;
};

export type CustomerActivityBundle = {
  orders: CustomerActivityOrder[];
  products: CustomerActivityProduct[]; // max 2
  reviews: CustomerActivityReview[];
  quotes: CustomerActivityQuote[];
};
