// src/lib/woocommerce/customers.ts
import { wcFetch } from "./client";

export type WcCustomer = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

export async function getCustomerIdByEmail(
  email: string
): Promise<number | null> {
  if (!email) return null;

  // GET /wp-json/wc/v3/customers?email=<email>
  const customers = await wcFetch<WcCustomer[]>("/customers", {
    params: { email },
  });

  if (!customers.length) return null;

  return customers[0].id;
}
