/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/woocommerce/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { redis } from "@/lib/redis";

const WEBHOOK_SECRET = process.env.WC_WEBHOOK_SECRET;

type WooWebhookTopic =
  | "product.created"
  | "product.updated"
  | "product.deleted";

interface WooProductPayload {
  id: number;
  slug?: string;
  name?: string;
}

// Helper: delete keys by pattern
async function deleteKeysByPattern(pattern: string) {
  if (!redis) return;

  const keysToDelete: string[] = [];

  if (typeof (redis as any).scanIterator === "function") {
    const iterator = (redis as any).scanIterator({
      match: pattern,
      count: 100,
    });

    for await (const key of iterator) {
      keysToDelete.push(String(key));
    }
  }

  if (keysToDelete.length) {
    await redis.del(...keysToDelete);
  }
}

async function handleProductInvalidation(product: WooProductPayload) {
  await deleteKeysByPattern("products:*");

  if (product.slug) {
    await deleteKeysByPattern(`product:${product.slug}:*`);
  }
}

function isSignatureValid(rawBody: string, signature: string | null) {
  // If either secret or signature is missing, don't enforce (for now)
  if (!WEBHOOK_SECRET || !signature) {
    console.warn(
      "Webhook signature not fully configured, skipping verification"
    );
    return true;
  }

  const computed = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const topic = req.headers.get(
      "x-wc-webhook-topic"
    ) as WooWebhookTopic | null;
    const signature = req.headers.get("x-wc-webhook-signature");

    const rawBody = await req.text();

    if (!isSignatureValid(rawBody, signature)) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!topic) {
      return NextResponse.json(
        { error: "Missing WooCommerce topic header" },
        { status: 400 }
      );
    }

    const body = JSON.parse(rawBody) as WooProductPayload;

    if (
      topic === "product.created" ||
      topic === "product.updated" ||
      topic === "product.deleted"
    ) {
      await handleProductInvalidation(body);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WooCommerce webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
