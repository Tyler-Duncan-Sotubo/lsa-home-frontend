import { PaymentMethod } from "@/config/types/footer.types";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaCcPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa6";
import { MdOutlineAccountBalance } from "react-icons/md";
import { IconType } from "react-icons";
import Image from "next/image";
const VERVE_WEBP_SRC =
  "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/verve_payment_method_icon_142696.webp";

type PaymentVisual =
  | { type: "icon"; Icon: IconType }
  | { type: "image"; src: string };

const PAYMENT_VISUAL: Record<
  PaymentMethod,
  { label: string; visual: PaymentVisual }
> = {
  visa: { label: "Visa", visual: { type: "icon", Icon: FaCcVisa } },
  mastercard: {
    label: "Mastercard",
    visual: { type: "icon", Icon: FaCcMastercard },
  },
  verve: { label: "Verve", visual: { type: "image", src: VERVE_WEBP_SRC } },
  amex: { label: "American Express", visual: { type: "icon", Icon: FaCcAmex } },
  discover: { label: "Discover", visual: { type: "icon", Icon: FaCcDiscover } },
  paypal: { label: "PayPal", visual: { type: "icon", Icon: FaCcPaypal } },
  apple_pay: { label: "Apple Pay", visual: { type: "icon", Icon: FaApplePay } },
  google_pay: {
    label: "Google Pay",
    visual: { type: "icon", Icon: FaGooglePay },
  },
  bank_transfer: {
    label: "Bank Transfer",
    visual: { type: "icon", Icon: MdOutlineAccountBalance },
  },
};

interface CopyrightBarProps {
  leftText?: string;
  payments?: {
    enabled: boolean;
    methods: PaymentMethod[]; // selected in admin
  };
  year?: number;
  config: {
    store: {
      name: string;
    };
  };
}

export const CopyrightBar = ({
  leftText,
  year,
  payments,
  config,
}: CopyrightBarProps) => {
  const computedYear = year ?? new Date().getFullYear();

  const showPayments = Boolean(payments?.enabled);

  const defaultLeft = `© ${computedYear} ${config.store.name}. All rights reserved.`;
  const hasContent = Boolean(leftText || showPayments);

  console.log("payments", payments?.methods);

  return (
    <section className="w-full border-t border-secondary/20 p-4 text-center text-xs text-secondary">
      {hasContent && (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p>{leftText ?? defaultLeft}</p>

          {showPayments && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(payments?.methods ?? {}).map(
                ([method, enabled]) => {
                  if (!enabled) return null;

                  const { label, visual } =
                    PAYMENT_VISUAL[method as PaymentMethod];
                  if (visual.type === "icon") {
                    const Icon = visual.Icon;
                    return (
                      <Icon
                        key={method}
                        aria-label={label}
                        title={label}
                        className="h-10 w-10 opacity-80"
                      />
                    );
                  }

                  if (visual.type === "image") {
                    return (
                      <span
                        key={method}
                        className="relative h-12 w-12 opacity-80"
                        title={label}
                        aria-label={label}
                      >
                        <Image
                          src={visual.src}
                          alt={label}
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      </span>
                    );
                  }

                  return null;
                }
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CopyrightBar;
