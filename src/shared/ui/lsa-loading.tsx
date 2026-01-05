"use client";

import Image from "next/image";

type Props = {
  logoUrl?: string;
  storeName?: string;
};

export default function LsaLoading({ logoUrl, storeName }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
      <div className="flex flex-col items-center gap-4">
        {/* STATIC CENTER LOGO */}
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={storeName ? `${storeName} Logo` : "Store Logo"}
            width={70}
            height={70}
            className="object-contain pointer-events-none"
            priority
          />
        ) : (
          <div className="h-17.5 w-17.5 rounded-md bg-muted" />
        )}

        {/* ANIMATED LOADING LINE */}
        <div className="relative w-24 h-0.75 overflow-hidden bg-gray-200 rounded-full">
          <div className="absolute top-0 left-0 h-full bg-green-600 rounded-full animate-lsa-line" />
        </div>
      </div>
    </div>
  );
}
