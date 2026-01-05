"use client";

import * as React from "react";
import LsaLoading from "@/shared/ui/lsa-loading";

export function HydrationLoading({
  logoUrl,
  storeName,
}: {
  logoUrl: string;
  storeName: string;
}) {
  const [hydrated, setHydrated] = React.useState(true);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  if (hydrated) return null;

  return <LsaLoading logoUrl={logoUrl} storeName={`${storeName} Logo`} />;
}
