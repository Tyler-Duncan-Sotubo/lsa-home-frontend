"use client";

import { useAppSelector } from "@/store/hooks";
import { useMoney } from "@/shared/hooks/use-money";
import { Badge } from "@/shared/ui/badge";
import type {
  LoyaltyBalance,
  LoyaltyLedgerEntry,
  LoyaltySettings,
} from "../actions/loyalty";

const LEDGER_LABEL: Record<LoyaltyLedgerEntry["type"], string> = {
  earn: "Earned",
  redeem: "Redeemed",
  adjust: "Adjusted",
};

const LEDGER_BADGE_CLASS: Record<LoyaltyLedgerEntry["type"], string> = {
  earn: "bg-emerald-50 text-emerald-700 border-emerald-200",
  redeem: "bg-amber-50 text-amber-700 border-amber-200",
  adjust: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CreditsTabClient({
  balance,
  ledger,
  settings,
}: {
  balance: LoyaltyBalance;
  ledger: LoyaltyLedgerEntry[];
  settings: LoyaltySettings;
}) {
  const store = useAppSelector((s) => s.runtimeConfig.store);
  const formatMoney = useMoney();

  if (!settings?.enabled) {
    return (
      <div className="mx-auto max-w-md py-20 text-center md:py-28">
        <h1 className="text-3xl font-semibold tracking-tight">
          Credits aren&apos;t available yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {store?.name ?? "This store"} hasn&apos;t turned on a loyalty
          programme yet. Check back later.
        </p>
      </div>
    );
  }

  const redemptionValue = formatMoney(
    (settings.minRedemptionPoints * settings.pointValueMinor) / 100,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">
          Your <span className="font-bold">{store?.name}</span> credits
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Earn points on every order and redeem them for discounts at
          checkout.
        </p>

        <div className="mt-6 rounded-xl bg-muted/40 p-5">
          <div className="text-sm text-muted-foreground">
            Worth {formatMoney(balance.valueMajor)} at checkout
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {balance.points.toLocaleString()} points
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {balance.lifetimeEarned.toLocaleString()} earned all-time
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">How you earn credits</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            Earn{" "}
            <span className="font-semibold">
              {settings.earnRate} point{settings.earnRate === 1 ? "" : "s"}
            </span>{" "}
            for every{" "}
            <span className="font-semibold">
              {formatMoney(settings.earnAmount)}
            </span>{" "}
            you spend — credited automatically once your order is paid.
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-sm">
            Redeem{" "}
            <span className="font-semibold">
              {settings.minRedemptionPoints.toLocaleString()} points
            </span>{" "}
            or more at checkout for {redemptionValue} off your order.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-base font-semibold">History</h2>

        {ledger.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No credit activity yet — it&apos;ll show up here once you place
            your first order.
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {ledger.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={LEDGER_BADGE_CLASS[entry.type]}
                    >
                      {LEDGER_LABEL[entry.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {entry.note}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    entry.points >= 0 ? "text-emerald-600" : "text-foreground"
                  }`}
                >
                  {entry.points >= 0 ? "+" : ""}
                  {entry.points.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
