"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import {
  CreateCustomerAddressDto,
  CustomerAddress,
  UpdateCustomerAddressDto,
} from "../types/address";
import {
  useCreateCustomerAddress,
  useDeleteCustomerAddress,
  useListCustomerAddresses,
  useUpdateCustomerAddress,
} from "../hooks/use-customer.addresses";
import { NG_REGION_CODES } from "@/shared/constants/ng-regions";

/**
 * Form schema excludes `label` + `country` (you'll inject them before submit).
 * Adjust requirements to match your backend expectations.
 */
const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  isDefaultBilling: z.boolean(),
  isDefaultShipping: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

function AddressSummary({ a }: { a: CustomerAddress }) {
  return (
    <div className="text-sm space-y-1">
      <div className="font-medium">
        {(a.label || "Address") +
          (a.isDefaultShipping ? " • Default shipping" : "") +
          (a.isDefaultBilling ? " • Default billing" : "")}
      </div>
      <div className="text-muted-foreground mt-1">
        {[a.firstName, a.lastName].filter(Boolean).join(" ") || "-"}
      </div>
      <div className="text-muted-foreground">
        {a.line1}
        {a.line2 ? `, ${a.line2}` : ""}
      </div>
      <div className="text-muted-foreground">
        {[a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
      </div>
      <div className="text-muted-foreground">{a.country}</div>
      {a.phone ? <div className="text-muted-foreground">{a.phone}</div> : null}
    </div>
  );
}

function AddressForm({
  initial,
  pending,
  submitLabel,
  onSubmit,
  /**
   * Provide these from outside (account settings, store config, etc.)
   * since country + label are not in the UI.
   */
  country = "Nigeria",
}: {
  initial?: Partial<CustomerAddress>;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (dto: CreateCustomerAddressDto | UpdateCustomerAddressDto) => void;
  country: string; // injected
  label?: string; // optional injected
}) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initial?.label ?? "",
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      line1: initial?.line1 ?? "",
      line2: initial?.line2 ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      postalCode: initial?.postalCode ?? "",
      phone: initial?.phone ?? "",
      isDefaultBilling: Boolean(initial?.isDefaultBilling),
      isDefaultShipping: Boolean(initial?.isDefaultShipping),
    },
    mode: "onSubmit",
  });

  const submit = form.handleSubmit((values) => {
    // Inject fields that are not collected in the UI.
    const dto = {
      ...values,
      country,
    } satisfies CreateCustomerAddressDto;

    onSubmit(dto);
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-3 px-3">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address label *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Home, Office, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 1 *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 2</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>

                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-16">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {NG_REGION_CODES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3">
          <FormField
            control={form.control}
            name="isDefaultShipping"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(x) => field.onChange(Boolean(x))}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Set as default shipping
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isDefaultBilling"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(x) => field.onChange(Boolean(x))}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Set as default billing
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function AccountAddressesClient() {
  const { data, isLoading, isError } = useListCustomerAddresses();

  const createAddr = useCreateCustomerAddress();
  const updateAddr = useUpdateCustomerAddress();
  const deleteAddr = useDeleteCustomerAddress();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [edit, setEdit] = React.useState<CustomerAddress | null>(null);

  // Wherever you want to source this from (store settings, user profile, etc.)
  const country = "Nigeria";

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError || !data)
    return (
      <p className="text-sm text-destructive">Failed to load addresses.</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Address Book</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your saved addresses.
          </p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>Add address</Button>
          </DialogTrigger>

          <DialogContent
            className="
              p-3 md:p-4 gap-0
              md:max-w-2xl w-[95%] h-[80vh] md:h-[90vh] overflow-auto
              max-w-none sm:max-w-none
              sm:rounded-sm md:rounded-md
            "
          >
            <DialogHeader className="my-4">
              <DialogTitle></DialogTitle>
            </DialogHeader>

            <AddressForm
              submitLabel="Create"
              pending={createAddr.isPending}
              country={country}
              onSubmit={(dto) => {
                createAddr.mutate(dto as CreateCustomerAddressDto, {
                  onSuccess: () => setOpenCreate(false),
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((a) => (
          <Card key={a.id}>
            <CardContent className="pt-6 space-y-4">
              <AddressSummary a={a} />

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEdit(a)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  type="button"
                  disabled={deleteAddr.isPending}
                  onClick={() => deleteAddr.mutate(a.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={(v) => (v ? null : setEdit(null))}>
        <DialogContent className="md:max-w-2xl w-[95%] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit address</DialogTitle>
          </DialogHeader>

          {edit ? (
            <AddressForm
              initial={edit}
              submitLabel="Update"
              pending={updateAddr.isPending}
              country={country}
              onSubmit={(dto) => {
                updateAddr.mutate(
                  { id: edit.id, dto: dto as UpdateCustomerAddressDto },
                  {
                    onSuccess: () => setEdit(null),
                  }
                );
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
