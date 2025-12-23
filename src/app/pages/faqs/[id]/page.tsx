import { notFound } from "next/navigation";
import { FaqDetailClient } from "@/features/faq/ui/faq-detail-client";
import { getFaqById } from "@/features/faq/server/get-faq-by-id";

interface FAQDetailPageProps {
  params: {
    id: string;
  };
}

export default async function FAQDetailPage({ params }: FAQDetailPageProps) {
  const { id } = await params;
  const faq = getFaqById(id);

  if (!faq) {
    notFound();
  }

  return <FaqDetailClient faq={faq} />;
}
