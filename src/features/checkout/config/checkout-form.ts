// src/features/checkout/config/checkout-form.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckoutFormInstance,
  CheckoutFormValues,
  checkoutSchema,
} from "@/features/checkout/types/checkout";

export const checkoutDefaultValues: CheckoutFormValues = {
  email: "",
  marketingOptIn: false,
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  country: "NG",
  deliveryMethod: "shipping",
  paymentMethod: "paystack",
  pickupState: "",
};

export function useCheckoutForm(): CheckoutFormInstance {
  return useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: checkoutDefaultValues,
  });
}
