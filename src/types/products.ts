// src/types/products.ts

export type WooMetaData = {
  id: number;
  key: string;
  value: unknown;
};

export type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WooAttribute = {
  id?: number;
  name: string;
  variation?: boolean;
  options: string[];
};

export type WooVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;

  image?: { src: string; alt?: string };
  images?: { src: string; alt?: string }[];

  attributes: { id?: number; name: string; option: string }[];

  stock_status: "instock" | "outofstock" | "onbackorder";
  in_stock: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;

  // ✅ needed for shipping calculation
  weight?: string | null;

  meta_data?: WooMetaData[];
};

// Raw Woo shape (what /products returns)
export type WooProductApi = {
  id: number;
  name: string;
  slug: string;
  permalink: string;

  type: "simple" | "variable" | string;

  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;

  price_html: string;

  average_rating: string;
  rating_count: number;

  images: { id: number; src: string; alt: string }[];

  tags: { id: number; name: string; slug: string }[];

  categories: WooCategory[];
  attributes?: WooAttribute[];

  description: string;
  short_description?: string;

  meta_data?: WooMetaData[];

  // note: IDs here in the raw API
  variations?: number[];

  // ✅ product-level stock info (used as fallback)
  stock_status?: "instock" | "outofstock" | "onbackorder";
  in_stock?: boolean;
  manage_stock?: boolean;
  stock_quantity?: number | null;

  // ✅ product-level weight (string in Woo)
  weight?: string | null;
};

// ✅ App-wide product type used in components
export type Product = Omit<WooProductApi, "variations"> & {
  variations?: WooVariation[];
};

// ✅ Props for gallery & other components
export interface ProductGalleryProps {
  product: Product;
}

// Props for the Quick View modal
export interface QuickViewDialogProps {
  open: boolean;
  product: Product | null; // base product to show
  onOpenChange: (open: boolean) => void;
}

// src/types/products.ts

export type ProductReview = {
  id: number;
  product_id: number;
  review: string; // the text content
  rating: number; // 1–5
  reviewer: string; // name
  reviewer_email?: string; // optional
  date_created: string;
  date_created_gmt: string;
  verified: boolean; // "verified owner" in Woo
  status: string; // e.g. "approved"
};
