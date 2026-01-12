"use client";

import { GreysteedLoader } from "./greysteed-loader";
import { SereneLoader } from "./serene-loader";
import { LoadingProgress } from "./loading-progress";

type Props = {
  logoUrl?: string;
  storeName?: string;
};

export default function LoadingComp({ logoUrl, storeName }: Props) {
  const brand = storeName?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-white/50">
      {/* Center loader */}
      <div className="flex h-full w-full items-center justify-center">
        {brand === "serene" ? (
          <SereneLoader logoUrl={logoUrl} storeName={storeName} />
        ) : brand === "greysteed" ? (
          <GreysteedLoader logoUrl={logoUrl} storeName={storeName} />
        ) : (
          <LoadingProgress />
        )}
      </div>
    </div>
  );
}
