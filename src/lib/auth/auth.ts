/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type Customer = {
  id: string;
  companyId: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/account/login" },

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
      }

      return token;
    },

    async session({ session, token }) {
      (session as any).user = (token as any).user;
      (session as any).backendTokens = (token as any).backendTokens;

      return session;
    },
  },
});
