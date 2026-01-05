"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    __sfAnalytics?: {
      page?: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track?: (eventName: string, extra?: any) => void;
      sessionId?: string;
    };
  }
}

export function AnalyticsTagLoader({ token }: { token?: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // IMPORTANT: make a STRING so this effect definitely runs on query changes
  const qs = searchParams?.toString() ?? "";
  const routeKey = qs ? `${pathname}?${qs}` : pathname;

  // 1) Load the tag script once
  useEffect(() => {
    if (!token) return;

    const backendBase =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ?? "";
    if (!backendBase) return;

    const id = "internal-analytics-tag";
    if (document.getElementById(id)) return;

    const script = document.createElement("script");
    script.id = id;
    script.async = true;

    // If NEXT_PUBLIC_BACKEND_URL is "http://localhost:4000"
    // then this should include /api here:
    script.src = `${backendBase}/api/storefront/analytics/tag.js?token=${encodeURIComponent(
      token
    )}`;

    script.onload = () => {
      console.log("[analytics] tag.js loaded", script.src);
      // fire once after load (covers cases where nav happened before script loaded)
      window.__sfAnalytics?.page?.();
    };

    script.onerror = (e) =>
      console.error("[analytics] tag.js failed", script.src, e);

    document.head.appendChild(script);
  }, [token]);

  // 2) Fire page view on every client-side navigation
  useEffect(() => {
    // wait until after route transition + DOM/title updates settle
    const fire = () => {
      if (window.__sfAnalytics?.page) {
        window.__sfAnalytics.page();
      } else {
        // script not ready yet: retry shortly (common on first navigation)
        setTimeout(() => window.__sfAnalytics?.page?.(), 250);
      }
    };

    requestAnimationFrame(fire);
    console.log("[analytics] route change -> page()", routeKey);
  }, [routeKey]);

  return null;
}
