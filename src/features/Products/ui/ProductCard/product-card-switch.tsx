import { useAppSelector } from "@/store/hooks";
import { ProductCard, ProductCardProps } from "./product-card";
import { ProductCardHoverActions } from "./product-card-hover-actions";

export type ProductCardVariant = "DEFAULT" | "HOVER_ACTIONS";

export function ProductCardSwitch({ ...props }: ProductCardProps) {
  const { product } = useAppSelector((s) => s.runtimeConfig.ui);
  const variant = product.productCardVariant;

  switch (variant) {
    case "HOVER_ACTIONS":
      return <ProductCardHoverActions {...props} />;
    case "DEFAULT":
    default:
      return <ProductCard {...props} />;
  }
}
