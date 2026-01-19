/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/checkout.ts
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

export const checkoutSchema = z
  .object({
    // contact
    email: z.email("Please enter a valid email address"),
    marketingOptIn: z.boolean(),

    // shipping fields (make optional at base level)
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    address1: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    address2: z.string().optional(),
    postalCode: z.string().optional(),
    // pickup fields (optional at base level)
    pickupState: z.string(),
    pickupLocationId: z.string().optional(),

    paymentMethod: z.union([
      z.literal("bank"),
      z.literal("cash"),
      z.literal("pos"),
      z.string().regex(/^gateway:[a-z0-9_-]+$/i, "Invalid gateway method"),
    ]),
    deliveryMethod: z.enum(["shipping", "pickup"]),
  })
  .superRefine((v, ctx) => {
    if (v.deliveryMethod === "shipping") {
      const req = [
        ["country", v.country],
        ["state", v.state],
        ["address1", v.address1],
        ["firstName", v.firstName],
        ["lastName", v.lastName],
        ["phone", v.phone],
      ] as const;

      for (const [field, val] of req) {
        if (!val?.trim()) {
          ctx.addIssue({ code: "custom", path: [field], message: "Required" });
        }
      }
    }

    if (v.deliveryMethod === "pickup") {
      if (!v.pickupState?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["pickupState"],
          message: "Select a state",
        });
      }
      if (!v.pickupLocationId?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["pickupLocationId"],
          message: "Select a pickup point",
        });
      }
    }
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export type DeliveryMethod = CheckoutFormValues["deliveryMethod"];
export type PaymentMethod = CheckoutFormValues["paymentMethod"];

export type CheckoutFormInstance = UseFormReturn<
  CheckoutFormValues,
  any,
  CheckoutFormValues
>;
