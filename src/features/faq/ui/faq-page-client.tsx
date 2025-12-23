"use client";

import Link from "next/link";
import { useFaqPageController } from "@/features/faq/hooks/use-faq-page-controller";

export function FaqPageClient() {
  const { grouped, sortedCategories, toggleCategory, getItemsToShow } =
    useFaqPageController();

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
            const questions = grouped[category] ?? [];
            const { showingAll, itemsToShow } = getItemsToShow(category);

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

                  {questions.length > 4 && (
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
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
