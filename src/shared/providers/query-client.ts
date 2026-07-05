import { QueryClient } from "@tanstack/react-query";

// Holds a reference to the browser's QueryClient so code outside the React
// tree (Redux thunks) can read/write the same cache the app renders from.
// Only ever set from a client-side effect in QueryProvider — never at
// module scope — so it can't leak a shared instance across SSR requests.
let browserQueryClient: QueryClient | null = null;

export function setBrowserQueryClient(client: QueryClient) {
  browserQueryClient = client;
}

export function getBrowserQueryClient(): QueryClient | null {
  return browserQueryClient;
}
