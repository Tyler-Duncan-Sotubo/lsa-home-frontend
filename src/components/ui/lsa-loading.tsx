"use client";

import Image from "next/image";

export default function LsaLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
      <div className="flex flex-col items-center gap-4">
        {/* STATIC CENTER LOGO */}
        <Image
          src="https://lsahome.co/cdn/shop/files/LSA-final-logo_light_green_transparent.png"
          alt="LSA Logo"
          width={70}
          height={70}
          className="object-contain pointer-events-none"
        />

        {/* ANIMATED LOADING LINE */}
        <div className="relative w-24 h-[3px] overflow-hidden bg-gray-200 rounded-full">
          <div className="absolute top-0 left-0 h-full bg-green-600 rounded-full animate-lsa-line" />
        </div>
      </div>
    </div>
  );
}
