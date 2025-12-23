/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCheckoutForm } from "@/features/checkout/config/checkout-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { refreshCartAndHydrate } from "@/store/cart-refresh-thunk";

function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(Number.isFinite(amount) ? amount : 0);
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...init });
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw data ?? { statusCode: res.status, message: res.statusText };
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

export function useCheckoutController(checkoutId: string) {
  const router = useRouter();
  const form = useCheckoutForm();
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // -----------------------------
  // Watch fields that affect shipping
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
  const pickupState = useWatch({ control: form.control, name: "pickupState" });
  const pickupLocationId = useWatch({
    control: form.control,
    name: "pickupLocationId",
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  // minimal readiness (you can relax/tighten this)
  const readyForShipping =
    deliveryMethod === "shipping" &&
    !!countryField?.trim() &&
    !!stateField?.trim() &&
    !!address1Field?.trim() &&
    !!firstNameField?.trim() &&
    !!lastNameField?.trim() &&
    !!phoneField?.trim();

  // for UI
  const canCalculateShipping = readyForShipping;

  // Build a signature so changes trigger recalculation
  const shippingKey = JSON.stringify({
    deliveryMethod,
    countryField,
    stateField,
    cityField,
    address1Field,
    firstNameField,
    lastNameField,
    phoneField,
  });

  // ✅ Debounce to avoid firing on each keystroke
  const debouncedShippingKey = useDebouncedValue(shippingKey, 450);

  // -----------------------------
  // Query: load checkout (source of truth)
  // -----------------------------
  const checkoutQuery = useQuery({
    queryKey: ["checkout", checkoutId],
    enabled: !!checkoutId,
    queryFn: () => fetchJson(`/api/checkout/${checkoutId}`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const checkout = checkoutQuery.data;
  const isLoading = checkoutQuery.isLoading;

  const pickupLocationsQuery = useQuery({
    queryKey: ["pickupLocations", pickupState],
    enabled: deliveryMethod === "pickup" && !!pickupState,
    queryFn: () =>
      fetchJson(
        `/api/checkout/pickup?state=${encodeURIComponent(pickupState)}`
      ),
    staleTime: 60_000,
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
        // fallback: just refetch checkout, don't poison cache
        qc.invalidateQueries({ queryKey: ["checkout", checkoutId] });
      }
    },
  });

  useEffect(() => {
    if (!checkout?.id) return;
    if (deliveryMethod !== "pickup") return;
    if (!pickupLocationId) return;

    setPickupMutation.mutate({
      checkoutId: checkout.id,
      deliveryMethodType: "pickup",
      pickupLocationId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout?.id, deliveryMethod, pickupLocationId]);

  useEffect(() => {
    if (deliveryMethod !== "pickup") return;
    form.setValue("pickupLocationId", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupState, deliveryMethod]);

  const isCalculatingShipping = setShippingMutation.isPending;

  // ✅ Auto-trigger shipping update when debounced address is ready
  useEffect(() => {
    if (!checkout?.id) return;
    if (!readyForShipping) return;

    const v = form.getValues();

    const dto = {
      checkoutId: checkout.id,
      deliveryMethodType: "shipping",
      countryCode: v.country,
      state: v.state,
      area: v.city,
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
    };

    setShippingMutation.mutate(dto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedShippingKey, checkout?.id, readyForShipping]);

  // -----------------------------
  // Mutation: complete checkout
  // -----------------------------
  type CompleteCheckoutInput = {
    checkoutId: string;
    paymentMethod: "bank" | "card";
  };

  const completeMutation = useMutation({
    mutationFn: ({ checkoutId }: CompleteCheckoutInput) =>
      fetchJson("/api/checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      }),

    onSuccess: (order, variables) => {
      if (variables.paymentMethod === "bank") {
        dispatch(refreshCartAndHydrate());
        router.push(`/order/pending/${order.id}`);
      } else {
        dispatch(refreshCartAndHydrate());
        router.push(`/order/success/${order.id}`);
      }
    },
  });

  const isSubmitting = completeMutation.isPending;

  // -----------------------------
  // Derived values from backend checkout
  // -----------------------------
  const items = checkout?.items ?? [];
  const subtotal = Number(checkout?.subtotal ?? 0);
  const shippingTotal = Number(checkout?.shippingTotal ?? 0);
  const total = Number(checkout?.total ?? subtotal + shippingTotal);

  const formattedSubtotal = useMemo(() => formatNGN(subtotal), [subtotal]);
  const formattedShipping = useMemo(
    () => (deliveryMethod === "pickup" ? null : formatNGN(shippingTotal)),
    [deliveryMethod, shippingTotal]
  );
  const formattedTotal = useMemo(() => formatNGN(total), [total]);

  const mobileAmount = canCalculateShipping
    ? formattedTotal
    : formattedSubtotal;
  const toggleSummary = () => setIsSummaryOpen((p) => !p);

  const onSubmit = async () => {
    if (!checkout?.id) return;
    // pickup guard
    if (deliveryMethod === "pickup" && !pickupLocationId) {
      form.setError("pickupLocationId" as any, {
        message: "Select a pickup point",
      });
      return;
    }

    // only bank transfer exists
    if (paymentMethod !== "bank") {
      form.setError("paymentMethod" as any, {
        message: "Select Bank transfer",
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
    formattedTotal,
    mobileAmount,

    // actions
    onSubmit,

    // optional: expose for UI
    error: checkoutQuery.error,
    refetch: checkoutQuery.refetch,

    pickupLocations: pickupLocationsQuery.data ?? [],
    isLoadingPickupLocations: pickupLocationsQuery.isLoading,

    isSettingPickup: setPickupMutation.isPending,
  };
}
