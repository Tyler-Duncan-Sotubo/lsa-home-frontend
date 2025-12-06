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

  if (keysToDelete.length) await redis.del(...keysToDelete);
}

async function handleProductInvalidation(product: WooProductPayload) {
  console.log("Invalidating product cache for slug:", product.slug);

  await deleteKeysByPattern("products:*");

  if (product.slug) {
    await deleteKeysByPattern(`product:${product.slug}:*`);
  }
}

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature || !WEBHOOK_SECRET) return false;

  const computed = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}

export async function POST(req: Request) {
  try {
    const topic = req.headers.get(
      "x-wc-webhook-topic"
    ) as WooWebhookTopic | null;
    const signature = req.headers.get("x-wc-webhook-signature");

    const rawBody = await req.text();

    // 🛡️ Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Safe to parse body now
    const body = JSON.parse(rawBody) as WooProductPayload;

    console.log("🟢 Verified Woo webhook:", topic, body);

    if (
      topic === "product.created" ||
      topic === "product.updated" ||
      topic === "product.deleted"
    ) {
      await handleProductInvalidation(body);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
