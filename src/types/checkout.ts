/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/checkout.ts
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";

export const checkoutSchema = z.object({
  // contact
  email: z.email("Please enter a valid email address"),
  marketingOptIn: z.boolean(),

  // shipping
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().optional(),
  phone: z
    .string()
    .min(7, "Phone is required")
    .regex(/^[0-9+\-\s]+$/, "Enter a valid phone number"),
  country: z.string().min(1, "Country is required"),

  // choices
  deliveryMethod: z.enum(["shipping", "pickup"]),
  paymentMethod: z.enum(["paystack", "bank", "pos"]),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export type DeliveryMethod = CheckoutFormValues["deliveryMethod"];
export type PaymentMethod = CheckoutFormValues["paymentMethod"];

export type CheckoutFormInstance = UseFormReturn<
  CheckoutFormValues,
  any,
  CheckoutFormValues
>;
