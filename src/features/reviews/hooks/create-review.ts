import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useRouter } from "next/navigation";

export const useCreateReview = (productId: string) => {
  const router = useRouter();

  return useCreateMutation({
    endpoint: `/api/catalog/reviews/storefront/${productId}`,
    successMessage: "Review submitted successfully!",
    onSuccess: () => {
      router.refresh();
    },
  });
};
