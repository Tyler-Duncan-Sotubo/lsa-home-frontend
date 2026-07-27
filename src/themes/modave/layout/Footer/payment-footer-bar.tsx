import { PaymentMethod } from "@/config/types/footer.types";
import { PaymentBadge } from "./payment-badge";

interface PaymentFooterBarProps {
  leftText?: string;
  payments?: {
    enabled: boolean;
    methods: { [key in PaymentMethod]?: boolean };
  };
  year?: number;
  config: {
    store: {
      name: string;
    };
  };
}

export const PaymentFooterBar = ({
  leftText,
  year,
  payments,
  config,
}: PaymentFooterBarProps) => {
  const computedYear = year ?? new Date().getFullYear();

  const showPayments = Boolean(payments?.enabled);

  const defaultLeft = `© ${computedYear} ${config.store.name}. All rights reserved.`;
  const hasContent = Boolean(leftText || showPayments);

  return (
    <section className="w-full py-2 text-xs text-center border-t border-secondary/20 text-secondary">
      {hasContent && (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm font-bold text-black">
            {leftText ?? defaultLeft}
          </p>

          {showPayments && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(payments?.methods ?? {}).map(
                ([method, enabled]) => {
                  if (!enabled) return null;
                  return (
                    <PaymentBadge
                      key={method}
                      method={method as PaymentMethod}
                    />
                  );
                },
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PaymentFooterBar;
