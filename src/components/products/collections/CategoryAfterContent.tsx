"use client";

import { useState, useRef, useEffect } from "react";
import { categorySeoContent } from "@/constants/category-seo-content";
import { Button } from "@/components/ui/button";

export function CategoryAfterContent({
  categoryName,
}: {
  categoryName: string;
}) {
  const html = categorySeoContent[categoryName];
  const [expanded, setExpanded] = useState(false);
  const [contentTooTall, setContentTooTall] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;

    // If content is taller than 300px → show "Show More"
    setContentTooTall(el.scrollHeight > 300);
  }, [html]);

  if (!html) return null;

  return (
    <section className="mt-12 max-w-none">
      {/* Content wrapper */}
      <div
        ref={contentRef}
        className={`prose prose-neutral transition-all overflow-hidden relative max-w-none ${
          expanded ? "max-h-[9999px]" : "max-h-[300px]"
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Fade gradient when collapsed */}
      {!expanded && contentTooTall && (
        <div className="pointer-events-none absolute left-0 right-0 h-20 -mt-20 bg-linear-to-t from-white to-transparent"></div>
      )}

      {/* Toggle button */}
      {contentTooTall && (
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
