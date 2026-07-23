// features/checkout/hooks/use-paystack-checkout.ts
"use client";

import { useCallback } from "react";

type PaystackTransaction = { trxref: string };
type PaystackPopupInstance = {
  resumeTransaction: (
    accessCode: string,
    options: {
      onSuccess: (transaction: PaystackTransaction) => void;
      onCancel: () => void;
      onError: (err: { message: string }) => void;
    },
  ) => void;
};

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopupInstance;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow retry on next call
      reject(new Error("Failed to load Paystack checkout"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

type CheckoutCallbacks = {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
  /** Called once, right when we start background-polling for a slow
   * confirmation (e.g. bank transfer) after the popup closes without a
   * clear success/failure — lets the caller show a "still confirming"
   * state instead of treating the closed popup as a cancellation. */
  onPendingConfirmation?: () => void;
};

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // bank transfer can take a few minutes

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param verify async function that confirms payment for a given reference
 * and throws/rejects if not yet confirmed — e.g. verifyStorefrontPaystack. */
export function usePaystackCheckout(verify: (reference: string) => Promise<unknown>) {
  const resumeCheckout = useCallback(
    async (
      accessCode: string,
      reference: string,
      callbacks: CheckoutCallbacks = {},
    ) => {
      try {
        await loadPaystackScript();
      } catch (err) {
        callbacks.onError?.(
          err instanceof Error
            ? err.message
            : "Failed to load Paystack checkout",
        );
        return;
      }

      if (!window.PaystackPop) {
        callbacks.onError?.("Paystack checkout is unavailable right now.");
        return;
      }

      const popup = new window.PaystackPop();

      popup.resumeTransaction(accessCode, {
        onSuccess: async () => {
          // Paystack's inline.js success payload (trxref/reference) has
          // proven inconsistent — it returns Paystack's own internal
          // reference here, not the one we generated and initialized the
          // transaction with, which makes our own /transaction/verify call
          // fail with "Transaction reference not found." Use the reference
          // we already know from initialize() instead — it never changes.
          try {
            await verify(reference);
            callbacks.onSuccess?.();
          } catch (err) {
            callbacks.onError?.(
              "Payment received but we couldn't confirm it yet — refresh in a moment." +
                (err instanceof Error ? ` (${err.message})` : ""),
            );
          }
        },
        onCancel: async () => {
          // The popup closes without telling us whether the payment is
          // still pending (e.g. bank transfer confirmation can take
          // minutes and the user closed the "waiting to confirm" screen)
          // or genuinely cancelled. A webhook confirms the order
          // server-side regardless of this popup, so poll for a bit
          // before treating this as a real cancellation.
          callbacks.onPendingConfirmation?.();
          const deadline = Date.now() + POLL_TIMEOUT_MS;
          while (Date.now() < deadline) {
            try {
              await verify(reference);
              callbacks.onSuccess?.();
              return;
            } catch {
              // not confirmed yet — wait and try again
            }
            await sleep(POLL_INTERVAL_MS);
          }
          callbacks.onCancel?.();
        },
        onError: (err) => callbacks.onError?.(err.message),
      });
    },
    [verify],
  );

  return { resumeCheckout };
}
