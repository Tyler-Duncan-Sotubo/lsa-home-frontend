import Image from "next/image";

export function DefaultLoader({
  logoUrl,
  storeName,
}: {
  logoUrl?: string;
  storeName?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
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

      <div className="relative w-24 h-0.75 overflow-hidden bg-gray-200 rounded-full">
        <div className="absolute top-0 left-0 h-full bg-green-600 rounded-full animate-lsa-line" />
      </div>
    </div>
  );
}
