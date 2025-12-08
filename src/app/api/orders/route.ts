import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { wcFetch } from "@/lib/woocommerce/client";
import { getCustomerIdByEmail } from "@/lib/woocommerce/customers";
import { ORDER_FIELDS } from "@/constants/product-api";

type WooOrder = {
  id: number;
  status: string;
  currency: string;
  total: string;
  date_created: string;
  customer_id: number;
  billing: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  line_items: {
    id: number;
    name: string;
    quantity: number;
    total: string;
  }[];
};

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const email = session.user?.email ?? "";

  if (!email) {
    return NextResponse.json(
      { message: "No email on session; cannot resolve orders" },
      { status: 400 }
    );
  }

  try {
    // 1. Try to resolve a WooCommerce customer by email
    const customerId = await getCustomerIdByEmail(email);

    let orders: WooOrder[] = [];

    if (customerId) {
      // 2a. Best path: fetch orders tied to that Woo customer
      orders = await wcFetch<WooOrder[]>("/orders", {
        params: {
          customer: customerId,
          per_page: 50,
          _fields: ORDER_FIELDS,
        },
      });
    } else {
      // 2b. Fallback: guest orders, filter by billing email server-side
      const allOrders = await wcFetch<WooOrder[]>("/orders", {
        params: {
          per_page: 100,
          _fields: ORDER_FIELDS,
        },
      });

      const lowerEmail = email.toLowerCase();
      orders = allOrders.filter(
        (o) => o.billing?.email?.toLowerCase() === lowerEmail
      );
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching WooCommerce orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
