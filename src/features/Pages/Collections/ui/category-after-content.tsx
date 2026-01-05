"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";

export function CategoryAfterContent({
  html,
  ui,
}: {
  html?: string;
  ui?: {
    afterContentExpandable?: boolean;
    afterContentCollapsedHeightPx?: number;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const [contentTooTall, setContentTooTall] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const collapsedPx = ui?.afterContentCollapsedHeightPx ?? 300;
  const expandable = ui?.afterContentExpandable ?? true;

  const measure = useEffectEvent(() => {
    setExpanded(false);

    if (!contentRef.current || !html || !expandable) {
      setContentTooTall(false);
      return;
    }

    setContentTooTall(contentRef.current.scrollHeight > collapsedPx);
  });

  useEffect(() => {
    measure();
  }, [, html, collapsedPx, expandable]);

  if (!html) return null;

  return (
    <section className="mt-12 max-w-none relative">
      <div
        ref={contentRef}
        className="prose prose-neutral transition-all overflow-hidden max-w-none"
        style={{ maxHeight: expanded ? "none" : `${collapsedPx}px` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {!expanded && contentTooTall && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 h-20 bg-linear-to-t from-white to-transparent" />
      )}

      {expandable && contentTooTall && (
        <Button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-sm font-medium underline text-foreground"
          variant="link"
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </section>
  );
}
