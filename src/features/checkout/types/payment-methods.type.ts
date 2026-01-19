export type ApiGateway = {
  method: "gateway";
  provider: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publicConfig?: Record<string, any> | null;
};

export type ApiBankTransfer = {
  method: "bank_transfer";
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions?: string | null;
  } | null;
};

export type ApiCash = {
  method: "cash";
  note?: string | null;
};

export type ApiPaymentMethod = ApiGateway | ApiBankTransfer | ApiCash;
