"use client";

import Image from "next/image";

interface CartItem {
  id: number | string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  attributes?: Record<string, string>;
}

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  return (
    <div
      className="flex gap-5 mt-3 space-y-3"
      key={`${item.id}-${JSON.stringify(item.attributes)}`}
    >
      {/* Image + quantity badge */}
      <div className="relative h-24 w-24 shrink-0 overflow-visible rounded-md bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded-md"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}

        <span
          className="
            absolute top-0 right-0
            translate-x-1/3 -translate-y-1/3
            inline-flex h-8 min-w-8 items-center justify-center
            rounded-full bg-primary-foreground text-white
            text-[14px] font-bold shadow-md z-50
          "
        >
          {item.quantity}
        </span>
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium">{item.name}</p>

          {item.attributes && (
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
              {Object.entries(item.attributes)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <span key={k}>
                    <span className="capitalize">{k}:</span> {v}
                  </span>
                ))}
            </div>
          )}

          <div className="flex items-center justify-end text-md font-medium px-3">
            <span className="font-semibold">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
              }).format(item.unitPrice * item.quantity)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
