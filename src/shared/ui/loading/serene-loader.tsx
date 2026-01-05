import Image from "next/image";

export function SereneLoader({
  logoUrl,
  storeName,
}: {
  logoUrl?: string;
  storeName?: string;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Spinning ring */}
      <div className="h-24 w-24 rounded-full border-2 border-muted animate-spin border-t-green-600" />

      {/* Center logo */}
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={storeName ? `${storeName} Logo` : "Store Logo"}
          width={48}
          height={48}
          className="absolute object-contain pointer-events-none"
          priority
        />
      )}
    </div>
  );
}
