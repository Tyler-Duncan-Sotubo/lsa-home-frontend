import { auth } from "@/lib/auth/auth";
import {
  getLoyaltyBalance,
  getLoyaltyLedger,
  getLoyaltySettings,
} from "@/features/Account/credits/actions/loyalty";
import CreditsTabClient from "@/features/Account/credits/ui/credits-tab-client";

export default async function CreditsPage() {
  const session = await auth();
  const token = session?.backendTokens.accessToken;

  if (!token) {
    return <p className="text-sm text-destructive">Unauthorized</p>;
  }

  const [balance, ledger, settings] = await Promise.all([
    getLoyaltyBalance(token),
    getLoyaltyLedger({ limit: 20 }, token),
    getLoyaltySettings(token),
  ]);

  return (
    <CreditsTabClient balance={balance} ledger={ledger} settings={settings} />
  );
}
