import { faqs } from "@/shared/assets/data/faq";

export function getFaqById(id: string) {
  return faqs.find((faq) => faq.id === id) ?? null;
}
