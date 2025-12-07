/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce/client";
import { calculateShippingRate } from "@/lib/shipping";
import type { DeliveryMethod, PaymentMethod } from "@/types/checkout";
import { clearWooProductCache } from "@/lib/woocommerce/cache";

interface CheckoutRequestBody {
  contact: {
    email: string;
    marketingOptIn: boolean;
  };
  shipping: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode?: string;
    phone: string;
    country: string;
  };
  deliveryMethod: DeliveryMethod; // "shipping" | "pickup"
  paymentMethod: PaymentMethod; // "paystack" | "bank" | "pos"
  items: Array<{
    id: number | string;
    name: string;
    unitPrice: number;
    quantity: number;
    weightKg?: number;
    attributes?: Record<string, string | null>;
  }>;
  cartTotal: number;
  shippingAmount?: number | null; // optional from client
  totalWithShipping?: number | null; // optional from client
}

export async function POST(req: NextRequest) {
  let body: CheckoutRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    contact,
    shipping,
    deliveryMethod,
    paymentMethod,
    items,
    cartTotal,
    shippingAmount: clientShippingAmount,
  } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const isPickup = deliveryMethod === "pickup";

  // 1️⃣ Decide shippingAmount
  // For now: prefer client value if present, otherwise calculate.
  // Later you can drop clientShippingAmount entirely for stricter security.
  let shippingAmount: number;

  if (isPickup) {
    shippingAmount = 0;
  } else if (typeof clientShippingAmount === "number") {
    shippingAmount = clientShippingAmount;
  } else {
    shippingAmount = calculateShippingRate({
      deliveryMethod,
      state: shipping.state,
      items,
    });
  }

  const totalWithShipping = cartTotal + shippingAmount;

  // 2️⃣ Map cart items → Woo line_items
  const lineItems = items.map((item) => ({
    product_id: Number(item.id),
    quantity: item.quantity,
    subtotal: String(item.unitPrice * item.quantity),
    total: String(item.unitPrice * item.quantity),
  }));

  // 3️⃣ Shipping lines for Woo (none for pickup)
  const shippingLines = !isPickup
    ? [
        {
          method_id: "flat_rate", // must match an existing Woo shipping method ID
          method_title: "Standard Shipping",
          total: String(shippingAmount),
        },
      ]
    : [];

  // 4️⃣ Payment method mapping (POS-focused for now)
  let payment_method = "pos"; // Woo gateway ID you’ve configured
  let payment_method_title = "POS (In-store)";

  if (paymentMethod === "bank") {
    payment_method = "bacs"; // Woo default bank transfer gateway ID
    payment_method_title = "Bank Transfer";
  } else if (paymentMethod === "paystack") {
    payment_method = "paystack"; // assuming you have a Paystack gateway with this ID
    payment_method_title = "Paystack";
  }

  const orderPayload = {
    payment_method,
    payment_method_title,
    set_paid: false, // POS & bank: mark paid manually in Woo later
    status: "on-hold",
    billing: {
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      address_1: shipping.address1,
      address_2: shipping.address2 ?? "",
      city: shipping.city,
      state: shipping.state,
      postcode: shipping.postalCode ?? "",
      country: shipping.country,
      email: contact.email,
      phone: shipping.phone,
    },
    shipping: {
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      address_1: shipping.address1,
      address_2: shipping.address2 ?? "",
      city: shipping.city,
      state: shipping.state,
      postcode: shipping.postalCode ?? "",
      country: shipping.country,
    },
    line_items: lineItems,
    shipping_lines: shippingLines,
    meta_data: [
      {
        key: "_lsahome_delivery_method",
        value: deliveryMethod,
      },
      {
        key: "_lsahome_marketing_opt_in",
        value: contact.marketingOptIn ? "yes" : "no",
      },
      {
        key: "_lsahome_total_with_shipping",
        value: String(totalWithShipping),
      },
    ],
  };

  try {
    // 5️⃣ Create Woo order using your wcFetch helper
    const order = await wcFetch<any>("/orders", {
      method: "POST",
      data: orderPayload,
    });

    await clearWooProductCache();

    const redirectUrl = `/checkout/thank-you?order=${order.id}`;

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.number,
      redirectUrl,
    });
  } catch (err) {
    console.error("WooCommerce order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create order in WooCommerce" },
      { status: 500 }
    );
  }
}
