import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";
import { extractErrorMessage } from "../utils/error-handler";
type RefetchKey =
  | string
  | string[]
  | Array<{
      key: string;
      params?: unknown;
    }>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UpdateMutationParams<T> = {
  endpoint: string;
  successMessage?: string;
  refetchKey?: RefetchKey;
  onSuccess?: (updated: unknown) => void;
  onError?: (errorMsg: string) => void;
  method?: "PATCH" | "PUT"; // Default is PATCH
};

/**
 * Reusable mutation hook for updating data via PATCH/PUT request.
 */
export function useUpdateMutation<T>({
  endpoint,
  successMessage,
  refetchKey,
  onSuccess,
  onError,
  method = "PATCH",
}: UpdateMutationParams<T>) {
  const queryClient = useQueryClient();

  /**
   * Executes the mutation.
   * @param data - The data to be sent in the request.
   * @param setError - Function to set error state in the UI.
   * @param onClose - Optional function to close a modal.
   */
  const update = async (
    data?: T,
    setError?: (errorMsg: string) => void,
    onClose?: () => void
  ) => {
    try {
      const res = await axiosInstance({
        method,
        url: endpoint,
        data,
      });

      if (res.data && successMessage) {
        toast.success(successMessage || "Update successful");

        onClose?.(); // Close modal if provided

        if (refetchKey) {
          if (typeof refetchKey === "string") {
            // backward compatible: "reviews products"
            refetchKey.split(" ").forEach((key) => {
              queryClient.invalidateQueries({ queryKey: [key] });
            });
          } else if (Array.isArray(refetchKey)) {
            refetchKey.forEach((item) => {
              if (typeof item === "string") {
                queryClient.invalidateQueries({ queryKey: [item] });
              } else {
                queryClient.invalidateQueries({
                  queryKey: [item.key, item.params],
                });
              }
            });
          }
        }

        onSuccess?.(res.data);

        // **return the created data** for the caller
        return res.data;
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      // Display error in UI
      setError?.(errorMessage);

      // Show error toast
      toast.error(errorMessage ?? "An error occurred");

      onError?.(errorMessage);
    }
  };

  return update;
}
