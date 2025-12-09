// app/refund-policy/page.tsx

import { Metadata } from "next";
import { refundPolicyHtml } from "@/assets/data/policies";

export const metadata: Metadata = {
  title: "Refund Policy | LSA HOME",
  description:
    "Read LSA HOME’s refund and return policy to understand eligibility, procedures, and timelines for returns, exchanges, and refunds.",
  keywords: [
    "LSA HOME refund policy",
    "returns",
    "exchange policy",
    "money back",
    "order refund",
  ],
  openGraph: {
    title: "Refund Policy | LSA HOME",
    description:
      "Learn about LSA HOME’s refund and return process, eligibility, and timelines.",
    type: "article",
    url: "https://lsahome.co/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-[90%] max-w-6xl my-10">
      {refundPolicyHtml.map((section, i) => (
        <div
          key={i}
          className="prose prose-slate max-w-none px-4 md:px-0"
          dangerouslySetInnerHTML={{ __html: section }}
        />
      ))}
    </div>
  );
}
