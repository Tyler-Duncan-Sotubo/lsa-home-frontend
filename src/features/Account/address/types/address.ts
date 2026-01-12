// src/features/Account/types/address.ts
export type CustomerAddress = {
  id: string;
  companyId: string;
  customerId: string;

  label: string | null;
  firstName: string | null;
  lastName: string | null;

  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;

  isDefaultBilling: boolean;
  isDefaultShipping: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateCustomerAddressDto = {
  label?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;

  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
};

export type UpdateCustomerAddressDto = Partial<CreateCustomerAddressDto>;
