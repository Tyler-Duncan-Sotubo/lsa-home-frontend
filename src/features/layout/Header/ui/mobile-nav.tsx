"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "../../../../shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Menu, User, Heart, MapPin } from "lucide-react";
import type { NavItem } from "@/config/types/header-types";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

type MobileExtraIcon = "account" | "wishlist" | "stores";

type Props = {
  items: NavItem[];
  extraLinks?: Array<{
    label: string;
    href: string;
    icon?: MobileExtraIcon;
  }>;
  logoUrl?: string;
  storeName: string;
};

export function MobileNav({ items, extraLinks, logoUrl, storeName }: Props) {
  const [open, setOpen] = React.useState(false);

  const closeSheet = React.useCallback(() => {
    setOpen(false);
  }, []);

  // Treat the first mega item as "Shop" (or any mega item labelled "Shop")
  const shopItem = React.useMemo(() => {
    const byLabel = items.find(
      (i) => i.type === "mega" && i.label.toLowerCase() === "shop"
    );
    return (byLabel ?? items.find((i) => i.type === "mega")) as
      | Extract<NavItem, { type: "mega" }>
      | undefined;
  }, [items]);

  const topLevelLinks = React.useMemo(() => {
    // everything except mega "Shop" goes as normal links
    return items.filter(
      (i) => i.type !== "mega" || i.label !== shopItem?.label
    );
  }, [items, shopItem?.label]);

  return (
    <div className="flex items-center md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="size-8" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-screen max-w-none p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle></SheetTitle>
            <Link
              href="/"
              onClick={closeSheet}
              className="flex items-center gap-2"
            >
              {logoUrl ? (
                <div className="relative h-10 w-24">
                  <Image
                    src={logoUrl}
                    alt={storeName}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold">{storeName}</span>
              )}
            </Link>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
            {/* ✅ No "Shop" label. Directly render sections as AccordionTriggers */}
            {shopItem?.sections?.length ? (
              <Accordion type="multiple" className="w-full">
                {shopItem.sections.map((section) => (
                  <AccordionItem
                    key={section.title}
                    value={`sec:${section.title}`}
                    className="border-b"
                  >
                    <AccordionTrigger className="px-2 py-3 text-left text-sm font-semibold hover:no-underline">
                      {section.title}
                    </AccordionTrigger>

                    <AccordionContent className="pb-2">
                      <div className="flex flex-col">
                        {(section.items ?? []).map((link) => (
                          <Link
                            key={`${link.label}:${link.href}`}
                            href={link.href}
                            onClick={closeSheet}
                            className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}

            {/* other top-level links */}
            {topLevelLinks.map((item) => (
              <Link
                key={`${item.label}:${item.href}`}
                href={item.href}
                onClick={closeSheet}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}

            {!!extraLinks?.length && (
              <div className="mt-6 flex flex-col gap-2 border-t pt-4 text-sm">
                {extraLinks.map((l) => (
                  <Link
                    key={`${l.label}:${l.href}`}
                    href={l.href}
                    onClick={closeSheet}
                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted"
                  >
                    {l.icon ? <ExtraIcon name={l.icon} /> : null}
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ExtraIcon({ name }: { name: MobileExtraIcon }) {
  switch (name) {
    case "account":
      return <User className="h-4 w-4" />;
    case "wishlist":
      return <Heart className="h-4 w-4" />;
    case "stores":
      return <MapPin className="h-4 w-4" />;
    default:
      return null;
  }
}
