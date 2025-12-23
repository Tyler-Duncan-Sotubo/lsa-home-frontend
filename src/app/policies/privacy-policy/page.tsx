import { Metadata } from "next";
import PrivacyPolicyClient from "@/features/policies/ui/privacy-policy-client";

export const metadata: Metadata = {
  title: "Privacy Policy | LSA HOME",
  description:
    "Read LSA HOME’s Privacy Policy to understand how we collect, use, store, and protect your personal information.",
  keywords: [
    "LSA HOME privacy policy",
    "data protection",
    "personal information",
    "customer privacy",
    "LSA policies",
  ],
  openGraph: {
    title: "Privacy Policy | LSA HOME",
    description:
      "Learn how LSA HOME collects, processes, and protects your personal data across all services and interactions.",
    type: "article",
    url: "https://lsahome.co/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
