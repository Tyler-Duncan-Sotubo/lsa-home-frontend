import { combineReducers, configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./wishlistSlice";
import recentlyViewedReducer from "./recentlyViewedSlice";
import cartReducer from "./cartSlice";
import quoteReducer from "./quoteSlice";
import runtimeConfigReducer from "./runtimeConfigSlice";

const rootReducer = combineReducers({
  wishlist: wishlistReducer,
  recentlyViewed: recentlyViewedReducer,
  cart: cartReducer,
  quote: quoteReducer,
  runtimeConfig: runtimeConfigReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// A module-level singleton store would leak state across requests on the
// server (Node reuses the module cache), so each SSR request — and the
// client on initial mount — must get its own instance via this factory.
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
