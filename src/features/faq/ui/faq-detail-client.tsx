"use client";

import Link from "next/link";

interface FaqDetailClientProps {
  faq: {
    id: string;
    category: string;
    question: string;
    answer: string;
  };
}

export function FaqDetailClient({ faq }: FaqDetailClientProps) {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-[95%] md:max-w-6xl">
        <div className="mb-6">
          <Link
            href="/pages/faqs"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
          >
            ← Back to all FAQs
          </Link>
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">
          {faq.category}
        </p>

        <h1 className="mb-4 text-3xl font-semibold text-slate-900">
          {faq.question}
        </h1>

        <div
          className="prose prose-sm max-w-none sm:prose-base prose-ul:list-disc prose-ul:pl-5 prose-li:my-0.5 prose-p:my-2 prose-a:text-slate-900 prose-a:underline"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      </div>
    </main>
  );
}
