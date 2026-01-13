"use client";

import Image from "next/image";
import type { StorefrontConfigV1 } from "@/config/types/types";

type Props = {
  config: StorefrontConfigV1;
  kinds?: Array<"store-not-found" | "maintenance">; // optional filter
};

const imageSizeByKind: Record<
  "store-not-found" | "maintenance",
  { heightClass: string; maxWidthClass: string }
> = {
  "store-not-found": {
    heightClass: "h-48 md:h-56",
    maxWidthClass: "max-w-md",
  },
  maintenance: {
    heightClass: "h-64 md:h-100",
    maxWidthClass: "max-w-xl",
  },
};

export function SystemPageClient({ config, kinds }: Props) {
  const sys = config.ui?.systemPage;

  if (sys?.kind !== "store-not-found" && sys?.kind !== "maintenance") {
    return null;
  }

  // If caller provided allowed kinds, enforce it
  if (kinds && !kinds.includes(sys.kind)) return null;

  const defaultTitle =
    sys.kind === "maintenance" ? "We’ll be back soon" : "Store not found";

  const size = imageSizeByKind[sys.kind] ?? imageSizeByKind["store-not-found"];

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl px-6 text-center flex flex-col items-center gap-4">
        {sys.image?.src ? (
          <div
            className={`relative w-full ${size.heightClass} ${size.maxWidthClass}`}
          >
            <Image
              src={sys.image.src}
              alt={sys.image.alt ?? sys.title ?? defaultTitle}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : null}

        <h1 className="text-3xl font-semibold">{sys.title ?? defaultTitle}</h1>

        {sys.description ? (
          <p className="text-sm opacity-80">{sys.description}</p>
        ) : null}
      </div>
    </main>
  );
}
