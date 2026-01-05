import Image from "next/image";

export function GreysteedLoader({
  logoUrl,
  storeName,
}: {
  logoUrl?: string;
  storeName?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={storeName ? `${storeName} Logo` : "Store Logo"}
          width={64}
          height={64}
          className="object-contain pointer-events-none"
          priority
        />
      )}

      <div className="flex gap-2">
        <span className="h-2 w-10 bg-gray-800 animate-pulse" />
        <span className="h-2 w-10 bg-gray-600 animate-pulse delay-150" />
        <span className="h-2 w-10 bg-gray-400 animate-pulse delay-300" />
      </div>
    </div>
  );
}
