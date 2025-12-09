"use client";

import { useState } from "react";
import { faqs } from "@/assets/data/faq";
import Link from "next/link";

type Faq = (typeof faqs)[number];

const PRODUCT_SOURCE_CATEGORIES = [
  "Pillows",
  "Duvets",
  "Bath",
  "Mattress",
  "Sheets",
  "Fragrances",
  "Products",
  "Miscellaneous",
];

function getGroupCategory(faq: Faq): string {
  if (PRODUCT_SOURCE_CATEGORIES.includes(faq.category)) return "Products";

  if (faq.category === "Privacy") return "Privacy";
  if (faq.category === "Your Account") return "Your Account";
  if (faq.category === "Returns") return "Returns";
  if (faq.category === "Orders") return "Orders";
  if (faq.category === "Delivery & Payments") return "Delivery & Payments";

  return faq.category;
}

export default function FAQPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group by category
  const grouped = faqs.reduce((acc, faq) => {
    const key = getGroupCategory(faq);
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {} as Record<string, Faq[]>);

  const categoryOrder = [
    "Orders",
    "Delivery & Payments",
    "Returns",
    "Products",
    "Privacy",
    "Your Account",
  ];

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);

    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;

    return ia - ib;
  });

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-[90%] max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Tap a question to see the full answer.
          </p>
        </header>

        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {sortedCategories.map((category) => {
            const questions = grouped[category];

            const showingAll = expandedCategory === category;
            const itemsToShow = showingAll ? questions : questions.slice(0, 4);

            return (
              <section key={category} className="space-y-4">
                <h2 className="text-3xl font-semibold text-slate-900">
                  {category}
                </h2>

                <div className="space-y-2">
                  {itemsToShow.map((faq) => (
                    <Link
                      key={faq.id}
                      href={`/pages/faqs/${faq.id}`}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-200 pb-2 text-left text-base font-medium text-slate-900 hover:text-slate-950 hover:underline"
                    >
                      <span>{faq.question}</span>
                    </Link>
                  ))}

                  {/* See More / See Less */}
                  {questions.length > 4 && (
                    <button
                      onClick={() =>
                        setExpandedCategory(showingAll ? null : category)
                      }
                      className="mt-3 text-sm font-semibold text-slate-700 hover:underline"
                    >
                      {showingAll
                        ? "See less"
                        : `See more (${questions.length - 4} more)`}
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
