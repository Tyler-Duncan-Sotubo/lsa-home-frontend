// providers/auth-provider.tsx
"use client";

import { useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

function RefreshErrorWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    // The refresh token itself is dead (expired/invalid) — the jwt callback
    // already tried and failed to renew it, so keep retrying forever would
    // just loop on 401s. Sign out cleanly instead.
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ redirect: false });
    }
  }, [session?.error]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RefreshErrorWatcher />
      {children}
    </SessionProvider>
  );
}
