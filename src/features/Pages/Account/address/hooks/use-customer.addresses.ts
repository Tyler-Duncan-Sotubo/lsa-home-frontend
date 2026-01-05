/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Axios from "axios";
import {
  CreateCustomerAddressDto,
  CustomerAddress,
  UpdateCustomerAddressDto,
} from "../types/address";
import { toast } from "sonner";

export function useListCustomerAddresses() {
  return useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: async (): Promise<CustomerAddress[]> => {
      const res = await Axios.get("/api/account/addresses");
      return res.data.data as CustomerAddress[];
    },
  });
}

export function useCreateCustomerAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      dto: CreateCustomerAddressDto
    ): Promise<CustomerAddress> => {
      const res = await Axios.post("/api/account/addresses", dto);
      return res.data.data as CustomerAddress;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to delete address");
    },
  });
}

export function useUpdateCustomerAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      dto: UpdateCustomerAddressDto;
    }): Promise<CustomerAddress> => {
      const res = await Axios.patch(
        `/api/account/addresses/${input.id}`,
        input.dto
      );
      return res.data.data as CustomerAddress;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to delete address");
    },
  });
}

export function useDeleteCustomerAddress() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: true }> => {
      const res = await Axios.delete(`/api/account/addresses/${id}`);
      return res.data.data as { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to delete address");
    },
  });
}
