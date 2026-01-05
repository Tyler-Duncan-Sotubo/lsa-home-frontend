"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        We couldn’t load this product. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
      >
        Retry
      </button>
    </div>
  );
}
