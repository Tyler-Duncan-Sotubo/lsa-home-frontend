/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/checkout.ts
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

// export const checkoutSchema = z.object({
//   // contact
//   email: z.email("Please enter a valid email address"),
//   marketingOptIn: z.boolean(),

//   // pickup
//   pickupState: z.string(),
//   pickupLocationId: z.string().optional(),

//   // shipping
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   address1: z.string().min(1, "Address is required"),
//   address2: z.string().optional(),
//   city: z.string().min(1, "City is required"),
//   state: z.string().min(1, "State is required"),
//   postalCode: z.string().optional(),
//   phone: z
//     .string()
//     .min(7, "Phone is required")
//     .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
//   country: z.string().min(1, "Country is required"),

//   // choices
//   deliveryMethod: z.enum(["shipping", "pickup"]),
//   paymentMethod: z.enum(["paystack", "bank", "pos"]),
// });

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

    paymentMethod: z.enum(["paystack", "bank", "pos"]),
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
