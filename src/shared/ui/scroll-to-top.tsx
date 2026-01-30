"use client";

import { useEffect } from "react";
import { useSelectedLayoutSegments } from "next/navigation";

export default function ScrollToTop() {
  const segments = useSelectedLayoutSegments();
  const segmentsPath = segments.join("/");

  useEffect(() => {
    // scroll instantly
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [segmentsPath]);

  return null;
}
