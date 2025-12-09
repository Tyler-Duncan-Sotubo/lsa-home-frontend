// app/terms-of-service/page.tsx

import { Metadata } from "next";
import {
  termsOfServiceHtml,
  termsOfServiceSections14to20,
} from "@/assets/data/policies";

export const metadata: Metadata = {
  title: "Terms of Service | LSA HOME",
  description:
    "Review LSA HOME’s Terms of Service to understand your rights, responsibilities, and the conditions for using our website and services.",
  keywords: [
    "LSA HOME terms",
    "terms of service",
    "LSA HOME policies",
    "service agreement",
    "legal terms",
  ],
  openGraph: {
    title: "Terms of Service | LSA HOME",
    description:
      "Read the official Terms of Service outlining how you may use LSA HOME’s website and services.",
    type: "article",
    url: "https://lsahome.co/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  // merge arrays into one
  const fullTerms = [...termsOfServiceHtml, ...termsOfServiceSections14to20];

  return (
    <div className="mx-auto w-[90%] max-w-6xl my-10">
      {fullTerms.map((section, i) => (
        <div
          key={i}
          className="prose prose-slate max-w-none px-4 md:px-0"
          dangerouslySetInnerHTML={{ __html: section }}
        />
      ))}
    </div>
  );
}
