// src/lib/auth/next-auth.d.ts
import { DefaultSession } from "next-auth";

interface BackendTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // whatever your backend returns (epoch ms or similar)
}

type StorefrontCustomer = {
  id: string;
  companyId: string;
  email: string;
  name?: string;
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: StorefrontCustomer;
    backendTokens: BackendTokens;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: StorefrontCustomer;
    backendTokens: BackendTokens;
    accessTokenExpires: number;
  }
}
