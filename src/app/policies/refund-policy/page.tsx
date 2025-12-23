import { Metadata } from "next";
import RefundPolicyClient from "@/features/policies/ui/refund-policy-client";

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
  return <RefundPolicyClient />;
}
