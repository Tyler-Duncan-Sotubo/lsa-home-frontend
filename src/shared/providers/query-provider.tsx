"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBrowserQueryClient } from "./query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  // Only runs in the browser, once this instance is actually mounted —
  // never during SSR — so the module-level ref can't leak across requests.
  useEffect(() => {
    setBrowserQueryClient(client);
  }, [client]);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
