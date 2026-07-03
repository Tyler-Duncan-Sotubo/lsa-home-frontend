import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";

export default async function PaymentLinkSuccessPage() {
  const config = await getStorefrontConfig();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Payment Received!</h1>
          <p className="text-muted-foreground">
            Thank you for your payment. A receipt has been sent to your email.
          </p>
        </div>

        {config.store?.name && (
          <Link
            href="/"
            className="inline-block text-sm text-primary underline underline-offset-4"
          >
            Continue shopping at {config.store.name}
          </Link>
        )}
      </div>
    </div>
  );
}
