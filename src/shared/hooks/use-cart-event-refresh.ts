// src/hooks/useCartEventRefresh.ts
"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { refreshCartAndHydrate } from "@/store/cart-refresh-thunk";

export function useCartEventRefresh(enabled = true) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      if (!navigator.onLine) return;
      dispatch(refreshCartAndHydrate());
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [dispatch, enabled]);
}
