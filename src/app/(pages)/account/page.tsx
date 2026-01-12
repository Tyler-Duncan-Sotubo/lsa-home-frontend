// app/account/page.tsx
import { AccountDashboardClient } from "@/features/Account/core/ui/account-dashboard-client";
import { auth } from "@/lib/auth/auth";

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">You are not logged in</h2>
        <p className="mt-2 text-muted-foreground">
          Please sign in to access your account.
        </p>
      </div>
    );
  }

  return <AccountDashboardClient />;
}
