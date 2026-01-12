"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AccountHomePageConfigV1 } from "@/config/types/pages/Account/account-home-page.types";
import { RevealFromSide } from "@/shared/animations/reveal-from-side";
import { SectionReveal } from "@/shared/animations/section-reveal";
import { Stagger, StaggerItem } from "@/shared/animations/stagger";
import { signOut } from "next-auth/react";
import { Button } from "@/shared/ui/button";

export type AccountNavItem = {
  label: string;
  href?: string; // if missing, render as button or disabled item
  onClick?: () => void;
};

export function AccountClient({
  config,
  children,
}: {
  config?: AccountHomePageConfigV1;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-[95%] py-6 ">
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        {/* LEFT */}
        <RevealFromSide direction="left">
          <aside className="md:sticky md:top-6 h-fit">
            <SectionReveal delay={0.05}>
              <div className="p-4">
                {config?.ui?.greetingLines ? (
                  <div className="text-xl font-semibold leading-snug">
                    {config.ui.greetingLines.map((l, idx) => (
                      <div key={idx}>{l}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            </SectionReveal>

            <nav className="p-2">
              <Stagger
                className="space-y-1"
                delayChildren={0.08}
                staggerChildren={0.06}
              >
                <ul className="space-y-1">
                  {config?.ui?.nav?.map((item) => {
                    const active = item.href ? pathname === item.href : false; // exact only

                    const base =
                      "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-muted";

                    if (item.href) {
                      return (
                        <StaggerItem
                          key={item.label}
                          y={8}
                          className="list-none"
                        >
                          <li>
                            <Link
                              href={item.href}
                              className={cn(base, active && "font-bold")}
                              aria-current={active ? "page" : undefined}
                            >
                              {item.label}
                            </Link>
                          </li>
                        </StaggerItem>
                      );
                    }

                    return (
                      <StaggerItem key={item.label} y={8} className="list-none">
                        <li>
                          <Button
                            variant={"link"}
                            type="button"
                            onClick={
                              item.action === "logout"
                                ? () => {
                                    signOut({
                                      callbackUrl: "/login",
                                    });
                                  }
                                : undefined
                            }
                            className={cn(
                              base,
                              "text-left text-red-600 cursor-pointer"
                            )}
                          >
                            {item.label}
                          </Button>
                        </li>
                      </StaggerItem>
                    );
                  })}
                </ul>
              </Stagger>
            </nav>
          </aside>
        </RevealFromSide>

        {/* RIGHT */}
        <RevealFromSide direction="up">
          <main className="min-w-0 py-4">{children}</main>
        </RevealFromSide>
      </div>
    </div>
  );
}
