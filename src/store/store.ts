import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./wishlistSlice";
import recentlyViewedReducer from "./recentlyViewedSlice";
import cartReducer from "./cartSlice";
import quoteReducer from "./quoteSlice";
import runtimeConfigReducer from "./runtimeConfigSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
    cart: cartReducer,
    quote: quoteReducer,
    runtimeConfig: runtimeConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
