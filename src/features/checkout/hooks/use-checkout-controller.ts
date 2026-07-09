/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/features/checkout/config/checkout-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { refreshCartAndHydrate } from "@/store/cart-refresh-thunk";
import { toast } from "sonner";

function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number.isFinite(amount) ? amount : 0);
}

/**
 * ✅ IMPORTANT:
 * Throw a normalized error shape so FE can reliably read:
 * - statusCode / status
 * - message
 * - action
 */
async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...init });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = {
      status: res.status,
      statusCode: data?.statusCode ?? data?.status ?? res.status,
      message: data?.message ?? data?.error?.message ?? res.statusText,
      action: data?.action ?? null,
      ...data,
    };
    throw err;
  }

  return data;
}

// ✅ Debounce helper
function useDebouncedValue<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type NormalizedPayment = {
  paymentMethodType: "gateway" | "bank_transfer" | "cash";
  paymentProvider?: string | null;
};

function normalizePaymentMethod(raw: string): NormalizedPayment {
  const v = String(raw ?? "").trim();
  if (!v) return { paymentMethodType: "bank_transfer" };

  if (v.startsWith("gateway:")) {
    const provider = v.split(":")[1]?.trim() || null;
    return { paymentMethodType: "gateway", paymentProvider: provider };
  }
  if (v === "bank") return { paymentMethodType: "bank_transfer" };
  if (v === "cash") return { paymentMethodType: "cash" };
  return { paymentMethodType: "bank_transfer" };
}

function isExpiredCheckout(err: any) {
  const statusCode = err?.statusCode ?? err?.status;
  const action = err?.action ?? err?.error?.action;
  const msg = String(err?.message ?? err?.error?.message ?? "").toLowerCase();

  // ✅ be tolerant: sometimes action is missing, message exists
  return (
    statusCode === 410 &&
    (action === "RECREATE_CHECKOUT" || msg.includes("checkout has expired"))
  );
}

function getErrMsg(err: any) {
  return (
    err?.error?.message ?? err?.message ?? err?.error ?? "Something went wrong"
  );
}

export function useCheckoutController(checkoutId: string) {
  const router = useRouter();
  const form = useCheckoutForm();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // ✅ stop auto-mutations while refreshing checkout
  const [isRefreshingCheckout, setIsRefreshingCheckout] = useState(false);

  // ✅ prevent refresh loops (only one refresh attempt per checkoutId)
  const refreshAttemptedRef = useRef<string | null>(null);

  // -----------------------------
  // Watch fields
  // -----------------------------
  const deliveryMethod = useWatch({
    control: form.control,
    name: "deliveryMethod",
  });

  const countryField = useWatch({ control: form.control, name: "country" });
  const stateField = useWatch({ control: form.control, name: "state" });
  const cityField = useWatch({ control: form.control, name: "city" });
  const address1Field = useWatch({ control: form.control, name: "address1" });
  const firstNameField = useWatch({ control: form.control, name: "firstName" });
  const lastNameField = useWatch({ control: form.control, name: "lastName" });
  const phoneField = useWatch({ control: form.control, name: "phone" });
  const email = form.getValues("email");
  const pickupState = useWatch({ control: form.control, name: "pickupState" });
  const pickupLocationId = useWatch({
    control: form.control,
    name: "pickupLocationId",
  });

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  }) as "bank" | "cash" | `gateway:${string}` | "" | undefined;

  const shippingOptionId = useWatch({
    control: form.control,
    name: "shippingOptionId",
  });

  const canCalculateShipping =
    deliveryMethod === "pickup" ||
    (deliveryMethod === "shipping" && !!shippingOptionId?.trim());

  // -----------------------------
  // Query: checkout
  // -----------------------------
  const checkoutQuery = useQuery({
    queryKey: ["checkout", checkoutId],
    enabled: !!checkoutId,
    queryFn: () => fetchJson(`/api/checkout/${checkoutId}`),
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false, // ✅ don’t spam when 410
  });

  const checkout = checkoutQuery.data;
  const isLoading = checkoutQuery.isLoading;

  // -----------------------------
  // Query: pickup locations
  // -----------------------------
  const pickupLocationsQuery = useQuery({
    queryKey: ["pickupLocations", pickupState],
    enabled: deliveryMethod === "pickup" && !!pickupState,
    queryFn: () =>
      fetchJson(
        `/api/checkout/pickup?state=${encodeURIComponent(pickupState)}`,
      ),
    staleTime: 60_000,
  });

  // -----------------------------
  // Query: shipping options (debounced so free-text state doesn't fire on every keystroke)
  // -----------------------------
  const debouncedState = useDebouncedValue(stateField, 600);

  const shippingOptionsQuery = useQuery({
    queryKey: ["shippingOptions", debouncedState],
    enabled: deliveryMethod === "shipping" && !!debouncedState?.trim(),
    queryFn: () =>
      fetchJson(
        `/api/checkout/shipping-options?state=${encodeURIComponent(debouncedState!)}`,
      ),
    staleTime: 60_000,
  });

  const shippingOptions: Array<{
    id: string;
    name: string;
    states: string[];
    area?: string;
    price: number;
  }> = shippingOptionsQuery.data?.data ?? shippingOptionsQuery.data ?? [];

  // -----------------------------
  // Refresh checkout helper
  // Expects POST /api/checkout/refresh { checkoutId } -> { checkoutId: newId } OR { id: newId } OR { data: { checkoutId|id } }
  // -----------------------------
  const refreshCheckout = async (oldCheckoutId: string) => {
    if (!oldCheckoutId) return null;

    // prevent infinite loop per id
    if (refreshAttemptedRef.current === oldCheckoutId) return null;
    refreshAttemptedRef.current = oldCheckoutId;

    setIsRefreshingCheckout(true);
    try {
      const refreshed = await fetchJson("/api/checkout/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId: oldCheckoutId }),
      });

      const newId =
        refreshed?.checkoutId ??
        refreshed?.id ??
        refreshed?.data?.checkoutId ??
        refreshed?.data?.id ??
        null;

      if (!newId) throw new Error("Checkout refresh did not return an id");

      // clear stale caches
      qc.removeQueries({ queryKey: ["checkout", oldCheckoutId] });
      qc.removeQueries({ queryKey: ["checkout", newId] });

      toast.message("Checkout refreshed", {
        description: "Your session expired — we created a new checkout.",
      });

      router.replace(`/checkout/${newId}`);
      return newId;
    } catch (err: any) {
      toast.error(err?.message ?? "Unable to refresh checkout");
      return null;
    } finally {
      setIsRefreshingCheckout(false);
    }
  };

  // ✅ If the checkout GET fails with 410, refresh immediately
  useEffect(() => {
    const err: any = checkoutQuery.error;
    if (!err) return;
    if (!isExpiredCheckout(err)) return;
    if (!checkoutId) return;
    if (isRefreshingCheckout) return;

    refreshCheckout(checkoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutQuery.error, checkoutId, isRefreshingCheckout]);

  // -----------------------------
  // Mutation: discount code
  // -----------------------------
  const syncCheckoutAfterDiscount = async () => {
    if (!checkoutId) return;
    const updated = await fetchJson(`/api/checkout/${checkoutId}/sync`, {
      method: "POST",
    });
    qc.setQueryData(["checkout", checkoutId], updated);
  };

  const applyDiscountCodeMutation = useMutation({
    mutationFn: (code: string) =>
      fetchJson("/api/cart/discount-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }),
    onSuccess: async () => {
      await syncCheckoutAfterDiscount();
    },
    onError: async (err: any) => {
      if (isExpiredCheckout(err)) {
        await refreshCheckout(checkoutId);
        return;
      }
      toast.error(getErrMsg(err));
    },
  });

  const removeDiscountCodeMutation = useMutation({
    mutationFn: () =>
      fetchJson("/api/cart/discount-code", { method: "DELETE" }),
    onSuccess: async () => {
      await syncCheckoutAfterDiscount();
    },
    onError: async (err: any) => {
      toast.error(getErrMsg(err));
    },
  });

  // -----------------------------
  // Mutation: set shipping
  // -----------------------------
  const setShippingMutation = useMutation({
    mutationFn: (dto: any) =>
      fetchJson("/api/checkout/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }),

    onSuccess: (updated) => {
      qc.setQueryData(["checkout", checkoutId], updated);
      qc.invalidateQueries({ queryKey: ["checkout", checkoutId] });
    },

    onError: async (err: any) => {
      if (isExpiredCheckout(err)) {
        await refreshCheckout(checkoutId);
        return;
      }
      toast.error(getErrMsg(err));
    },
  });

  // -----------------------------
  // Mutation: set pickup
  // -----------------------------
  const setPickupMutation = useMutation({
    mutationFn: (dto: any) =>
      fetchJson("/api/checkout/pickup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }),

    onSuccess: (updated) => {
      if (updated?.id) {
        qc.setQueryData(["checkout", checkoutId], updated);
      } else {
        qc.invalidateQueries({ queryKey: ["checkout", checkoutId] });
      }
    },

    onError: async (err: any) => {
      console.log("pickup error", err);
      if (isExpiredCheckout(err)) {
        await refreshCheckout(checkoutId);
        return;
      }
      toast.error(getErrMsg(err));
      console.log("[checkout.pickup] error:", err);
    },
  });

  // Auto-pickup update
  useEffect(() => {
    if (isRefreshingCheckout) return;
    if (!checkout?.id) return;
    if (deliveryMethod !== "pickup") return;
    if (!pickupLocationId) return;

    setPickupMutation.mutate({
      checkoutId: checkout.id,
      deliveryMethodType: "pickup",
      pickupLocationId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout?.id, deliveryMethod, pickupLocationId, isRefreshingCheckout]);

  // reset pickup location when state changes
  useEffect(() => {
    if (deliveryMethod !== "pickup") return;
    form.setValue("pickupLocationId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupState, deliveryMethod]);

  const isCalculatingShipping = setShippingMutation.isPending;

  // Reset shipping option when state changes
  useEffect(() => {
    if (deliveryMethod !== "shipping") return;
    form.setValue("shippingOptionId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedState, deliveryMethod]);

  // Fire setShipping when customer picks a shipping option
  useEffect(() => {
    if (isRefreshingCheckout) return;
    if (!checkout?.id) return;
    if (deliveryMethod !== "shipping") return;
    if (!shippingOptionId?.trim()) return;

    const v = form.getValues();

    setShippingMutation.mutate({
      checkoutId: checkout.id,
      deliveryMethodType: "shipping",
      countryCode: form.getValues("country") || "NG",
      shippingOptionId,
      shippingAddress: {
        firstName: v.firstName,
        lastName: v.lastName,
        address1: v.address1,
        address2: v.address2,
        city: v.city,
        state: v.state,
        postalCode: v.postalCode,
        phone: v.phone,
        country: v.country,
        email: v.email,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingOptionId, checkout?.id, deliveryMethod, isRefreshingCheckout]);

  // -----------------------------
  // Mutation: complete checkout
  // -----------------------------
  type CompleteCheckoutInput = {
    checkoutId: string;
    paymentMethod: "bank" | "cash" | `gateway:${string}`;
  };

  const completeMutation = useMutation({
    mutationFn: async ({
      checkoutId,
      paymentMethod,
    }: CompleteCheckoutInput) => {
      const normalized = normalizePaymentMethod(paymentMethod);

      return fetchJson("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId,
          ...normalized,
        }),
      });
    },

    onSuccess: async (order: any, variables) => {
      const normalized = normalizePaymentMethod(variables.paymentMethod);

      dispatch(refreshCartAndHydrate());

      // Bank transfer / cash -> pending page
      if (normalized.paymentMethodType !== "gateway") {
        router.push(`/order/pending/${order.id}`);
        return;
      }

      // Paystack gateway
      if (normalized.paymentProvider === "paystack") {
        try {
          const paystack = await fetchJson("/api/paystack/initialize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              amount: Number(order.total ?? order.totalAmount ?? 0),
              currency: order.currency ?? "NGN",
              reference: order.reference ?? order.orderNumber ?? order.id,
              callbackUrl: `${window.location.origin}/order/pending/${order.id}`,
              metadata: {
                orderId: order.id,
                orderNumber: order.orderNumber ?? null,
              },
            }),
          });

          const authorizationUrl =
            paystack?.data?.authorizationUrl ??
            paystack?.data?.data?.authorizationUrl;

          if (!authorizationUrl) {
            toast.error("Unable to start Paystack payment.");
            // ✅ /order/[orderId] isn't a real route (only
            // /order/pending/[orderId] is) — this used to 404.
            router.push(`/order/pending/${order.id}`);
            return;
          }

          window.location.href = authorizationUrl;
          return;
        } catch (err: any) {
          toast.error(getErrMsg(err) || "Unable to start Paystack payment.");
          router.push(`/order/pending/${order.id}`);
          return;
        }
      }

      // Unknown gateway fallback
      router.push(`/order/pending/${order.id}`);
    },

    onError: async (err: any) => {
      if (isExpiredCheckout(err)) {
        console.log("[checkout.complete] expired checkout, refreshing...");
        await refreshCheckout(checkoutId);
        return;
      }
      toast.error(getErrMsg(err));
    },
  });

  const isSubmitting = completeMutation.isPending;

  // -----------------------------
  // Derived values
  // -----------------------------
  const items = checkout?.items ?? [];
  const subtotal = Number(checkout?.subtotal ?? 0);
  const shippingTotal = Number(checkout?.shippingTotal ?? 0);
  const discountTotal = Number(checkout?.discountTotal ?? 0);
  const total = Number(checkout?.total ?? subtotal + shippingTotal - discountTotal);
  const appliedDiscountCodeId = checkout?.appliedDiscountCodeId ?? null;

  const formattedSubtotal = useMemo(() => formatNGN(subtotal), [subtotal]);
  const formattedShipping = useMemo(
    () => (deliveryMethod === "pickup" ? null : formatNGN(shippingTotal)),
    [deliveryMethod, shippingTotal],
  );
  const formattedDiscount = useMemo(
    () => (discountTotal > 0 ? formatNGN(discountTotal) : null),
    [discountTotal],
  );
  const formattedTotal = useMemo(() => formatNGN(total), [total]);

  const mobileAmount = canCalculateShipping
    ? formattedTotal
    : formattedSubtotal;

  const toggleSummary = () => setIsSummaryOpen((p) => !p);

  const onSubmit = async () => {
    if (!checkout?.id) return;

    if (deliveryMethod === "pickup" && !pickupLocationId) {
      form.setError("pickupLocationId" as any, {
        message: "Select a pickup point",
      });
      return;
    }

    if (deliveryMethod === "shipping" && !shippingOptionId?.trim()) {
      form.setError("shippingOptionId" as any, {
        message: "Select a shipping option",
      });
      return;
    }

    if (!paymentMethod) {
      form.setError("paymentMethod" as any, {
        message: "Select a payment method",
      });
      return;
    }

    const normalized = normalizePaymentMethod(paymentMethod);

    if (
      normalized.paymentMethodType === "gateway" &&
      !normalized.paymentProvider
    ) {
      form.setError("paymentMethod" as any, {
        message: "Select a gateway provider",
      });
      return;
    }

    await completeMutation.mutateAsync({
      checkoutId: checkout.id,
      paymentMethod,
    });
  };

  return {
    form,
    items,
    checkout,

    // states
    isLoading,
    isSubmitting,
    isSummaryOpen,
    toggleSummary,

    // derived
    deliveryMethod,
    canCalculateShipping,
    isCalculatingShipping,

    // formatted
    formattedSubtotal,
    formattedShipping,
    formattedDiscount,
    formattedTotal,
    mobileAmount,

    // discount code
    appliedDiscountCodeId,
    applyDiscountCode: applyDiscountCodeMutation.mutateAsync,
    isApplyingDiscountCode: applyDiscountCodeMutation.isPending,
    removeDiscountCode: removeDiscountCodeMutation.mutateAsync,
    isRemovingDiscountCode: removeDiscountCodeMutation.isPending,

    // actions
    onSubmit,

    // optional: expose for UI
    error: checkoutQuery.error,
    refetch: checkoutQuery.refetch,

    pickupLocations: pickupLocationsQuery.data ?? [],
    isLoadingPickupLocations: pickupLocationsQuery.isLoading,

    shippingOptions,
    isLoadingShippingOptions: shippingOptionsQuery.isLoading,
    isSettingShipping: setShippingMutation.isPending,

    isSettingPickup: setPickupMutation.isPending,

    // useful flags
    isRefreshingCheckout,
  };
}
