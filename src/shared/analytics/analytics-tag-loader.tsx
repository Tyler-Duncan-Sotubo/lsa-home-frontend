/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    __sfAnalytics?: {
      page?: () => void;
      track?: (eventName: string, extra?: any) => void;
      sessionId?: string;
    };
  }
}

export function AnalyticsTagLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qs = searchParams?.toString() ?? "";
  const routeKey = qs ? `${pathname}?${qs}` : pathname;

  // 1) Load the tag script once (tokenless)
  useEffect(() => {
    const id = "internal-analytics-tag";
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.async = true;

    // tokenless universal script
    script.src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/storefront/analytics/tag.js`;

    script.onload = () => {
      window.__sfAnalytics?.page?.();
    };

    script.onerror = (e) =>
      console.error("[analytics] tag.js failed", script.src, e);

    document.head.appendChild(script);
  }, []);

  // 2) Fire page view on every client-side navigation
  useEffect(() => {
    const fire = () => {
      if (window.__sfAnalytics?.page) {
        window.__sfAnalytics.page();
      } else {
        setTimeout(() => window.__sfAnalytics?.page?.(), 250);
      }
    };
    requestAnimationFrame(fire);
  }, [routeKey]);

  return null;
}
