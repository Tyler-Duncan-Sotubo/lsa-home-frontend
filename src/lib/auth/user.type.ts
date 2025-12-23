export type CustomerTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // unix ms timestamp
  type: "customer";
};

export type CustomerUser = {
  id: string;
  email: string;
  name?: string | null;
  companyId: string;
  customerTokens: CustomerTokens;
};
