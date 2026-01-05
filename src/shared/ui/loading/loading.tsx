"use client";

import { DefaultLoader } from "./default-loader";
import { GreysteedLoader } from "./greysteed-loader";
import { SereneLoader } from "./serene-loader";

type Props = {
  logoUrl?: string;
  storeName?: string;
};

export default function LoadingComp({ logoUrl, storeName }: Props) {
  const brand = storeName?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
      {brand === "serene" ? (
        <SereneLoader logoUrl={logoUrl} storeName={storeName} />
      ) : brand === "greysteed" ? (
        <GreysteedLoader logoUrl={logoUrl} storeName={storeName} />
      ) : (
        <DefaultLoader logoUrl={logoUrl} storeName={storeName} />
      )}
    </div>
  );
}
