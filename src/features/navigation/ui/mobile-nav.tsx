import Link from "next/link";
import { Button } from "../../../shared/ui/button";
import { NavItem } from "../types/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Heart, MapPin, Menu, User } from "lucide-react";

export function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <div className="flex items-center md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
              <Link href="/account/login" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Sign In
              </Link>
              <Link
                href="/account/register"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" /> Wishlist
              </Link>
              <Link
                href="/pages/our-stores"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" /> Our Stores
              </Link>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
