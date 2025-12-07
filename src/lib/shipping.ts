import { DeliveryMethod } from "@/types/checkout";

export type ShippingCartItem = {
  quantity: number;
  weightKg?: number;
};

export function calculateShippingRate(options: {
  deliveryMethod: DeliveryMethod;
  state?: string;
  items: ShippingCartItem[];
}): number {
  const { deliveryMethod, state, items } = options;

  // 1. Pickup always free
  if (deliveryMethod === "pickup") return 0;

  // 2. Total weight
  const totalWeightKg = items.reduce((acc, item) => {
    const perUnit = item.weightKg ?? 0;
    return acc + perUnit * item.quantity;
  }, 0);

  // 3. No weight → fallback flat rate
  if (totalWeightKg <= 0) return getFlatFallbackRate(state);

  // 4. Decide rate
  const normalizedState = state?.toLowerCase().trim();
  const isLagos = normalizedState === "lagos";

  return getRateFromWeightBand(totalWeightKg, isLagos);
}

function getRateFromWeightBand(
  totalWeightKg: number,
  isLagos: boolean
): number {
  const bands = [
    { max: 2, lagos: 2500, other: 4000 },
    { max: 5, lagos: 3500, other: 5500 },
    { max: 10, lagos: 4500, other: 7000 },
    { max: Infinity, lagos: 6000, other: 9000 },
  ];

  const band = bands.find((b) => totalWeightKg <= b.max)!;
  return isLagos ? band.lagos : band.other;
}

function getFlatFallbackRate(state?: string): number {
  const isLagos = state?.toLowerCase().trim() === "lagos";
  return isLagos ? 3000 : 5000;
}
