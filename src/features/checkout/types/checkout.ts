/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/checkout.ts
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

export const checkoutSchema = z
  .object({
    // contact
    email: z
      .string()
      .optional()
      .refine((v) => !v?.trim() || z.email().safeParse(v).success, {
        message: "Please enter a valid email address",
      }),
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

    // shipping option (customer-selected)
    shippingOptionId: z.string().optional(),

    paymentMethod: z.union([
      z.literal("bank"),
      z.literal("cash"),
      z.literal("pos"),
      z.literal("whatsapp"),
      z.string().regex(/^gateway:[a-z0-9_-]+$/i, "Invalid gateway method"),
    ]),
    deliveryMethod: z.enum(["shipping", "pickup"]),
  })
  .superRefine((v, ctx) => {
    const isWhatsApp = v.paymentMethod === "whatsapp";

    // Every other payment method needs a real email for order updates;
    // WhatsApp reaches the customer via phone instead.
    if (!isWhatsApp && !v.email?.trim()) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Required" });
    }

    if (v.deliveryMethod === "shipping") {
      // WhatsApp only needs the delivery method decided, not the detailed
      // address fields — name/phone are covered by its own block below.
      const req = isWhatsApp
        ? []
        : ([
            ["country", v.country],
            ["state", v.state],
            ["address1", v.address1],
            ["firstName", v.firstName],
            ["lastName", v.lastName],
            ["phone", v.phone],
          ] as const);

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

    // WhatsApp checkout needs a name and phone regardless of delivery
    // method — pickup orders don't otherwise collect these.
    if (isWhatsApp) {
      const req = [
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
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export type DeliveryMethod = CheckoutFormValues["deliveryMethod"];
export type PaymentMethod = CheckoutFormValues["paymentMethod"];

export type CheckoutFormInstance = UseFormReturn<
  CheckoutFormValues,
  any,
  CheckoutFormValues
>;
