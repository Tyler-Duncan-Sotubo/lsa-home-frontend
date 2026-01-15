"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { ExploreMoreItemV1 } from "@/config/types/pages/Collections/collections-page.types";

export function ExploreMoreCard({ item }: { item: ExploreMoreItemV1 }) {
  return (
    <div className="overflow-hidden">
      <Link href={item.href} className="block">
        <div className="relative md:aspect-11/10 w-full aspect-square">
          <Image
            src={item.imageUrl ?? ""}
            alt={item.name ?? ""}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-center">{item.name}</h3>

        <div className="w-1/2 mx-auto my-6">
          <Button asChild className="w-full" variant={"clean"}>
            <Link href={item.href}>Shop now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
