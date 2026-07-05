/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { storefrontFetch } from "@/shared/api/fetch";

type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // absolute epoch ms
};

type Customer = {
  id: string;
  companyId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

// Refresh a little before the real expiry so an in-flight request doesn't
// race the backend's own clock.
const REFRESH_SKEW_MS = 60_000;

async function refreshBackendTokens(
  backendTokens: BackendTokens,
): Promise<BackendTokens> {
  const { tokens } = await storefrontFetch<{ tokens: BackendTokens }>(
    "/api/storefront/customers/refresh",
    {
      method: "POST",
      body: { refreshToken: backendTokens.refreshToken },
      cache: "no-store",
    },
  );

  return tokens;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {},

      authorize: async (credentials) => {
        const { customer, tokens } = credentials as {
          customer?: string;
          tokens?: string;
        };

        if (!customer || !tokens) return null;

        const parsedCustomer = JSON.parse(customer) as Customer;
        const parsedTokens = JSON.parse(tokens) as BackendTokens;

        return {
          ...parsedCustomer,
          backendTokens: parsedTokens,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;

        token.user = {
          id: u.id,
          companyId: u.companyId,
          email: u.email,
          name: u.name ?? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        };

        token.backendTokens = u.backendTokens;
        token.accessTokenExpires = u.backendTokens.expiresIn;
        delete (token as any).error;

        return token;
      }

      const currentTokens = (token as any).backendTokens as
        | BackendTokens
        | undefined;

      // No backend session yet (e.g. never logged in) — nothing to refresh.
      if (!currentTokens) return token;

      const expires = (token as any).accessTokenExpires as number | undefined;

      // Still comfortably valid — reuse as-is.
      if (Date.now() < (expires ?? 0) - REFRESH_SKEW_MS) {
        return token;
      }

      // Expired (or about to) — exchange the refresh token for a new pair
      // instead of leaving the customer stuck with a dead access token.
      try {
        const refreshed = await refreshBackendTokens(currentTokens);
        token.backendTokens = refreshed;
        token.accessTokenExpires = refreshed.expiresIn;
        delete (token as any).error;
      } catch {
        // Refresh token itself is dead — surface it so the client can sign
        // the customer out cleanly instead of looping on 401s forever.
        (token as any).error = "RefreshAccessTokenError";
      }

      return token;
    },

    async session({ session, token }) {
      (session as any).user = (token as any).user;
      (session as any).backendTokens = (token as any).backendTokens;
      (session as any).error = (token as any).error;

      return session;
    },
  },
});
