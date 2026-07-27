import Image from "next/image";
import { PaymentMethod } from "@/config/types/footer.types";
import { FaApplePay, FaGooglePay } from "react-icons/fa6";
import { MdOutlineAccountBalance } from "react-icons/md";
import { IconType } from "react-icons";

const S3_BASE =
  "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c";

type PaymentVisual =
  | { type: "image"; src: string }
  | { type: "icon"; Icon: IconType };

const PAYMENT_VISUAL: Record<
  PaymentMethod,
  { label: string; visual: PaymentVisual }
> = {
  visa: {
    label: "Visa",
    visual: { type: "image", src: "/images/payments/visa.svg" },
  },
  mastercard: {
    label: "Mastercard",
    visual: { type: "image", src: "/images/payments/mastercard.svg" },
  },
  amex: {
    label: "American Express",
    visual: { type: "image", src: "/images/payments/amex.svg" },
  },
  discover: {
    label: "Discover",
    visual: { type: "image", src: "/images/payments/discover.svg" },
  },
  paypal: {
    label: "PayPal",
    visual: { type: "image", src: "/images/payments/paypal.svg" },
  },
  verve: {
    label: "Verve",
    visual: {
      type: "image",
      src: `${S3_BASE}/verve_payment_method_icon_142696.webp`,
    },
  },
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

export function PaymentBadge({ method }: { method: PaymentMethod }) {
  const entry = PAYMENT_VISUAL[method];
  if (!entry) return null;
  const { label, visual } = entry;

  return (
    <span
      title={label}
      aria-label={label}
      className="relative flex items-center justify-center w-12 h-8 overflow-hidden bg-white border shrink-0 border-secondary/15"
    >
      {visual.type === "image" ? (
        <Image
          src={visual.src}
          alt={label}
          fill
          sizes="48px"
          className="object-contain p-1"
        />
      ) : (
        <visual.Icon className="w-5 h-5 text-secondary/80" />
      )}
    </span>
  );
}
