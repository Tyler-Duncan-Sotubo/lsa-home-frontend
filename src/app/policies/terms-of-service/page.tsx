import { Metadata } from "next";
import TermsOfServiceClient from "@/features/policies/ui/terms-of-service-client";

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
  return <TermsOfServiceClient />;
}
