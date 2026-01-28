"use client";

import { useAppSelector } from "@/store/hooks";
import { useSession } from "next-auth/react";

export function useCanSeePrice() {
  const { data: session } = useSession();
  const isLoggedIn = session?.user !== undefined;

  const rule = useAppSelector(
    (s) => s.runtimeConfig.ui.pricing.showPriceInDetails,
  );

  const priceRange = useAppSelector(
    (s) => s.runtimeConfig.ui.pricing.priceRange,
  );

  const canSee = rule === "always" || (rule === "loggedInOnly" && isLoggedIn);

  return {
    canSee,
    rule,
    isLoggedIn,
    priceRange,
  };
}
