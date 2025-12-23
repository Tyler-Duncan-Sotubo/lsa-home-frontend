export interface ThankYouControllerProps {
  orderId?: string;
}

export function useThankYou({ orderId }: ThankYouControllerProps) {
  return {
    orderId,
    hasOrderId: Boolean(orderId),
  };
}
