import Link from "next/link";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { PaymentFooterBar } from "@/features/layout/Footer/payment-footer-bar";

const POLICY_LINKS = [
  { href: "/policies/refund-policy", label: "Refund policy" },
  { href: "/policies/privacy-policy", label: "Privacy policy" },
  { href: "/policies/terms-of-service", label: "Terms of service" },
];

export function CheckoutFooter({ config }: { config: StorefrontConfigV1 }) {
  return (
    <footer>
      <div className="mx-auto w-[95%] max-w-6xl py-4">
        <nav className="flex flex-wrap justify-center mb-2 text-xs gap-x-6 gap-y-1 text-muted-foreground">
          {POLICY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <PaymentFooterBar
          payments={config.footer?.bottomBar?.payments}
          config={config}
        />
      </div>
    </footer>
  );
}
