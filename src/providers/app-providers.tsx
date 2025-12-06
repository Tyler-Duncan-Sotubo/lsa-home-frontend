"use client";

import { ReactNode, useEffect } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  hydrateWishlist,
  WishlistStateFromStorage,
} from "@/store/wishlistSlice";
import {
  hydrateRecentlyViewed,
  RecentlyViewedStateFromStorage,
} from "@/store/recentlyViewedSlice";
import { hydrateCart, CartStateFromStorage } from "@/store/cartSlice";

const WISHLIST_KEY = "wishlist:v1";
const RECENTLY_VIEWED_KEY = "recentlyViewed:v1";
const CART_KEY = "cart:v1";

function ReduxPersistence({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const recentlyViewed = useAppSelector((state) => state.recentlyViewed.items);
  const cartItems = useAppSelector((state) => state.cart.items);

  // hydrate on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const wishlistRaw = window.localStorage.getItem(WISHLIST_KEY);
      if (wishlistRaw) {
        const parsed = JSON.parse(wishlistRaw) as WishlistStateFromStorage;
        if (Array.isArray(parsed.items)) {
          dispatch(hydrateWishlist(parsed));
        }
      }

      const rvRaw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (rvRaw) {
        const parsed = JSON.parse(rvRaw) as RecentlyViewedStateFromStorage;
        if (Array.isArray(parsed.items)) {
          dispatch(hydrateRecentlyViewed(parsed));
        }
      }

      const cartRaw = window.localStorage.getItem(CART_KEY);
      if (cartRaw) {
        const parsed = JSON.parse(cartRaw) as CartStateFromStorage;
        if (Array.isArray(parsed.items)) {
          dispatch(hydrateCart(parsed));
        }
      }
    } catch {
      // ignore
    }
  }, [dispatch]);

  // persist wishlist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: WishlistStateFromStorage = { items: wishlist };
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(payload));
    } catch {}
  }, [wishlist]);

  // persist recently viewed
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: RecentlyViewedStateFromStorage = { items: recentlyViewed };
      window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(payload));
    } catch {}
  }, [recentlyViewed]);

  // persist cart items (not isOpen)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: CartStateFromStorage = { items: cartItems };
      window.localStorage.setItem(CART_KEY, JSON.stringify(payload));
    } catch {}
  }, [cartItems]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ReduxPersistence>{children}</ReduxPersistence>
    </ReduxProvider>
  );
}
