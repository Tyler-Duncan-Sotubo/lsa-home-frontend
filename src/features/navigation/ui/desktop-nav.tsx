"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavFeature, NavItem, NavSection } from "../types/types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/ui/navigation-menu";

export function DesktopNav({ items }: { items: NavItem[] }) {
  return (
    <NavigationMenu className="hidden flex-1 justify-center md:flex">
      <NavigationMenuList className="flex flex-row gap-2">
        {items.map((item) =>
          item.type === "mega" ? (
            <MegaNavItem key={item.label} item={item} />
          ) : (
            <SimpleNavItem
              key={item.label}
              href={item.href}
              className={
                item.label === "Sales & Offers"
                  ? "bg-red-600 text-white hover:bg-red-700 rounded-md h-9 flex items-center justify-center px-4 hover:underline-none"
                  : ""
              }
            >
              {item.label}
            </SimpleNavItem>
          )
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* ------------------ */
/* Mega menu item     */
/* ------------------ */

function MegaNavItem({
  item,
}: {
  item: NavItem & {
    type: "mega";
    sections: NavSection[];
    feature?: NavFeature;
  };
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className="
    bg-transparent!
    hover:bg-transparent!
    focus:bg-transparent!
    active:bg-transparent!
    data-[state=open]:bg-transparent!
    focus-visible:ring-0
    shadow-none
    border-none
    px-3 py-1
    text-sm font-medium
    hover:underline hover:font-semibold
    transition-all
    cursor-pointer
  "
      >
        {item.label}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <div className="grid gap-6 md:w-[700px] lg:w-[900px] lg:grid-cols-3 p-6">
          {/* Column 1 */}
          {item.sections?.[0] && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {item.sections[0].title}
              </p>
              <ul className="space-y-1">
                {item.sections[0].items.map((link) => (
                  <MegaListItem
                    key={link.label}
                    href={link.href}
                    title={link.label}
                    badge={link.badge}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Column 2 */}
          {item.sections?.[1] && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {item.sections[1].title}
              </p>
              <ul className="space-y-3">
                {item.sections[1].items.map((link) => (
                  <MegaListItem
                    key={link.label}
                    href={link.href}
                    title={link.label}
                    badge={link.badge}
                    description={link.description}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Column 3 — Featured tile */}
          {item.feature && (
            <NavigationMenuLink asChild>
              <Link
                href={item.feature.href}
                className="group flex h-full flex-col overflow-hidden rounded-md border bg-card no-underline outline-hidden transition-all duration-200 hover:shadow-md hover:bg-none"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={item.feature.image}
                    alt={item.feature.label}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1 p-4">
                  <div className="text-sm font-semibold group-hover:underline">
                    {item.feature.label}
                  </div>
                  <p className="text-xs leading-snug text-muted-foreground">
                    {item.feature.description}
                  </p>
                </div>
              </Link>
            </NavigationMenuLink>
          )}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

/* ------------------ */
/* Simple nav item    */
/* ------------------ */

function SimpleNavItem({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NavigationMenuItem>
      <Link
        href={href}
        className={`
    px-3 py-1 
    text-sm font-medium
    transition-all
    hover:underline 
    hover:font-semibold
    ${className}
  `}
      >
        {children}
      </Link>
    </NavigationMenuItem>
  );
}

/* ------------------ */
/* List item in mega  */
/* ------------------ */

function MegaListItem({
  title,
  children,
  href,
  badge,
  description,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  title: string;
  badge?: string;
  description?: string;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="
            block
            rounded-md
            px-2 py-1
            text-sm
            text-foreground
            bg-transparent
            hover:bg-transparent!
            focus:bg-transparent!
            focus-visible:ring-0
            outline-none
            hover:underline 
            hover:font-semibold
            transition-all
          "
        >
          <div>
            <div className="flex items-center">
              <div className="text-base font-medium leading-none hover:font-semibold">
                {title}
              </div>
              {badge && (
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            {children && <div className="mt-1">{children}</div>}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
