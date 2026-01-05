import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type SubmitQuotePayload = {
  customerEmail: string;
  customerNote?: string;
  items: Array<{
    productId?: string;
    variantId?: string;
    name: string;
    variantLabel?: string;
    attributes?: Record<string, string | null>;
    imageUrl?: string | null;
    quantity: number;
  }>;
};

export function useSubmitQuote() {
  return useMutation({
    mutationFn: async (payload: SubmitQuotePayload) => {
      const { data } = await axios.post("/api/quotes", payload);
      return data;
    },
  });
}
