"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useGetCustomerActivity } from "../hooks/use-customer-activity";

function Tile({
  title,
  description,
  footer,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "group bg-white p-5 transition-all min-h-45 flex flex-col justify-center",
        "hover:shadow-md hover:-translate-y-px",
        className ?? "",
      ].join(" ")}
    >
      {title ? <div className="text-base font-semibold">{title}</div> : null}

      {description ? (
        <div className="mt-3 text-sm text-muted-foreground">{description}</div>
      ) : null}

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AccountDashboardClient() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading, isError } = useGetCustomerActivity();

  const orders = data?.orders ?? [];
  const quotes = data?.quotes ?? [];
  const products = data?.products ?? [];
  const reviews = data?.reviews ?? [];

  // ✅ Filters requested:
  const pendingPaymentOrders = orders.filter(
    (o) => o.status === "pending_payment"
  );
  const newQuotes = quotes.filter((q) => q.status === "new"); // excludes converted

  // counts for summary tile
  const pendingCount = pendingPaymentOrders.length;
  const newQuotesCount = newQuotes.length;

  return (
    <div className="space-y-8">
      {/* TOP ROW – 2 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MY INFORMATION */}
        <Tile
          description={
            <div className="text-xl text-center">
              <div className="font-bold text-primary">
                {user?.name ?? "User Name"}
              </div>
              <div className="text-sm">{user?.email ?? "user@example.com"}</div>
            </div>
          }
          footer={
            <div className="flex justify-end">
              <Link
                href={"/account/information"}
                className="inline-block text-sm font-medium underline text-primary"
              >
                Modify
              </Link>
            </div>
          }
        />

        {/* MY ORDERS (and quotes info inside) */}
        <Link href="/account/orders" className="block">
          <Tile
            title="My Orders"
            description={
              isLoading ? (
                <div>Loading…</div>
              ) : isError ? (
                <div className="text-destructive">Failed to load.</div>
              ) : pendingCount === 0 && newQuotesCount === 0 ? (
                <div>No pending payments or new quotes.</div>
              ) : (
                <div className="space-y-3">
                  {/* Pending payment orders */}
                  {pendingCount > 0 ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Pending payment
                      </div>

                      <div className="mt-2 space-y-2">
                        {pendingPaymentOrders.slice(0, 3).map((o) => (
                          <div
                            key={o.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {o.orderNumber ?? o.id}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(String(o.createdAt))}
                              </div>
                            </div>

                            <div className="text-xs font-medium text-primary">
                              Pay now
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* New quotes */}
                  {newQuotesCount > 0 ? (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        New quotes
                      </div>

                      <div className="mt-2 space-y-2">
                        {newQuotes.slice(0, 3).map((q) => (
                          <div
                            key={q.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                Quote #{q.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(String(q.createdAt))}
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              View
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            }
            footer={
              !isLoading && !isError ? (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pendingCount} pending payment</span>
                  <span>{newQuotesCount} new quote(s)</span>
                </div>
              ) : null
            }
          />
        </Link>
      </div>

      {/* BOTTOM ROW – 3 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* MY CREDITS tile → show "Recently ordered" products (2 max) */}
        <Link href="/account/products" className="block">
          <Tile
            title="My Products"
            description={
              isLoading ? (
                "Loading…"
              ) : products.length === 0 ? (
                "No product ordered"
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-muted shrink-0">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-sm">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(String(p.lastOrderedAt))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
            footer={
              <div className="flex justify-end">
                <span className="inline-block text-sm font-medium underline text-primary">
                  View
                </span>
              </div>
            }
          />
        </Link>
        {/* LEFT custom credits tile stays but now uses real counts for extra info */}
        <div
          className={[
            "group bg-white px-5 py-8 transition-all min-h-45 flex flex-col justify-between ",
            "hover:shadow-md hover:-translate-y-px",
          ].join(" ")}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-3xl font-extrabold">₦0</p>
            <Link
              href={"/account/credits"}
              className="text-primary text-sm underline font-medium"
            >
              Read More
            </Link>
          </div>
          0 Credits Available
        </div>

        {/* MY REVIEWS tile → show latest 2 reviews */}
        <div>
          <Tile
            title="My Reviews"
            description={
              isLoading ? (
                "Loading…"
              ) : reviews.length === 0 ? (
                "No reviews yet."
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 2).map((r) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium truncate">
                          {r.product?.name ?? "Product"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {r.review}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(String(r.createdAt))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
