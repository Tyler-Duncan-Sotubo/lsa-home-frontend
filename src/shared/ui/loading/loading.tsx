"use client";

import { useEffect } from "react";
import { GreysteedLoader } from "./greysteed-loader";
import { SereneLoader } from "./serene-loader";
import { LoadingProgress } from "./loading-progress";

type Props = {
  logoUrl?: string;
  storeName?: string;
};

export default function LoadingComp({ logoUrl, storeName }: Props) {
  const brand = storeName?.toLowerCase();

  useEffect(() => {
    // lock scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // prevent layout shift when scrollbar disappears
    const prevGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = "stable";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.scrollbarGutter = prevGutter ?? "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/50">
      <div className="flex h-dvh w-full items-center justify-center">
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
