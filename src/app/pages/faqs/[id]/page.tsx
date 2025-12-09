// app/pages/faqs/[id]/page.tsx  (or app/faq/[id]/page.tsx – just be consistent)

import { notFound } from "next/navigation";
import Link from "next/link";
import { faqs } from "@/assets/data/faq";

interface FAQDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FAQDetailPage({ params }: FAQDetailPageProps) {
  // ⬇️ unwrap the params Promise
  const { id } = await params;

  const faq = faqs.find((item) => item.id === id);

  if (!faq) {
    return notFound();
  }

  return (
    <main className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-[95%] md:max-w-6xl">
        <div className="mb-6">
          <Link
            href="/pages/faqs" // or "/faq" depending on your list page route
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
