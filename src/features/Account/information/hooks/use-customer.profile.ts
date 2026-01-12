/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/Account/hooks/useCustomerProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Axios from "axios";
import type {
  CustomerProfile,
  UpdateCustomerProfileDto,
} from "../types/profile";
import { toast } from "sonner";

export type UpdateCustomerPasswordDto = {
  currentPassword: string;
  newPassword: string;
};

const internal = Axios.create({ baseURL: "" }); // same-origin

export function useGetCustomerProfile() {
  return useQuery({
    queryKey: ["customer", "profile"],
    queryFn: async (): Promise<CustomerProfile> => {
      const res = await internal.get("/api/account/profile");
      return res.data.data as CustomerProfile;
    },
  });
}

export function useUpdateCustomerProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      dto: UpdateCustomerProfileDto
    ): Promise<CustomerProfile> => {
      const res = await internal.patch("/api/account/profile", dto);
      return res.data.data as CustomerProfile;
    },
    onSuccess: (next) => {
      qc.setQueryData(["customer", "profile"], next);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to delete address");
    },
  });
}

export function useUpdateCustomerPassword() {
  return useMutation({
    mutationFn: async (
      dto: UpdateCustomerPasswordDto
    ): Promise<{ ok: true }> => {
      const res = await internal.patch("/api/account/profile/password", dto);
      return res.data.data as { ok: true };
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to update password");
    },
  });
}
