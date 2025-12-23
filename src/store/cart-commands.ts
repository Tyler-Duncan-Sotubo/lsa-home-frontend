import { createAsyncThunk } from "@reduxjs/toolkit";
import { closeCart } from "./cartSlice";
import { refreshCartAndHydrate } from "./cart-refresh-thunk";

export const prepareForCheckout = createAsyncThunk(
  "cart/prepareForCheckout",
  async (_, { dispatch }) => {
    await dispatch(refreshCartAndHydrate());
    dispatch(closeCart());

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "online" }), // optionally email
    });

    const checkout = await res.json();
    if (!res.ok) throw checkout;

    return checkout; // includes checkout.id
  }
);
