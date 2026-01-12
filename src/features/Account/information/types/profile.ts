// src/features/Account/types/profile.ts
export type CustomerProfile = {
  id: string;
  companyId: string;

  displayName: string | null;
  type: string | null;

  billingEmail: string | null;
  phone: string | null;
  taxId: string | null;

  marketingOptIn: boolean | null;
  isActive: boolean;
  createdAt: string;

  loginEmail: string | null;
  isVerified: boolean | null;
  lastLoginAt: string | null;
};

export type UpdateCustomerProfileDto = {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  phone?: string | null;
  billingEmail?: string | null;
  taxId?: string | null;

  marketingOptIn?: boolean | null;
};
