"use client";

import * as React from "react";
import {
  useGetCustomerProfile,
  useUpdateCustomerProfile,
  useUpdateCustomerPassword,
} from "../hooks/use-customer.profile";
import { toast } from "sonner";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function AccountInformationForm() {
  const { data, isLoading, isError } = useGetCustomerProfile();
  const update = useUpdateCustomerProfile();
  const passwordUpdate = useUpdateCustomerPassword();

  const [form, setForm] = React.useState({
    displayName: "",
    billingEmail: "",
    phone: "",
    taxId: "",
    marketingOptIn: false,
  });

  const [changePassword, setChangePassword] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  React.useEffect(() => {
    if (!data) return;
    setForm({
      displayName: data.displayName ?? "",
      billingEmail: data.billingEmail ?? "",
      phone: data.phone ?? "",
      taxId: data.taxId ?? "",
      marketingOptIn: Boolean(data.marketingOptIn),
    });
  }, [data]);

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (isError || !data)
    return <p className="text-sm text-destructive">Failed to load profile.</p>;

  const disabled = update.isPending;

  function onSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({
      displayName: form.displayName || null,
      billingEmail: form.billingEmail || null,
      phone: form.phone || null,
      taxId: form.taxId || null,
      marketingOptIn: form.marketingOptIn,
    });
  }

  function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    // basic client check (optional)
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    passwordUpdate.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    if (passwordUpdate.isSuccess) {
      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Information</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your customer details.
        </p>
      </div>

      {/* ✅ Profile form (method 1) */}
      <form onSubmit={onSubmitProfile} className="space-y-6">
        <div className="grid gap-6 bg-white p-8 md:grid-cols-2">
          <Field label="Display name">
            <Input
              value={form.displayName}
              onChange={(e) =>
                setForm((p) => ({ ...p, displayName: e.target.value }))
              }
              placeholder="Your name"
            />
          </Field>

          <Field label="Billing email">
            <Input
              type="email"
              value={form.billingEmail}
              onChange={(e) =>
                setForm((p) => ({ ...p, billingEmail: e.target.value }))
              }
              placeholder="you@example.com"
              disabled
            />
          </Field>

          <Field label="Phone">
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+44 …"
            />
          </Field>

          <Field label="Tax ID">
            <Input
              value={form.taxId}
              onChange={(e) =>
                setForm((p) => ({ ...p, taxId: e.target.value }))
              }
              placeholder="Optional"
            />
          </Field>

          <div className="flex items-center gap-3 md:col-span-2">
            <Checkbox
              checked={form.marketingOptIn}
              onCheckedChange={(v) =>
                setForm((p) => ({ ...p, marketingOptIn: Boolean(v) }))
              }
              id="marketing"
            />
            <Label htmlFor="marketing" className="text-sm">
              Marketing opt-in
            </Label>
          </div>

          <div className="flex items-center gap-4 md:col-span-2">
            <Button type="submit" disabled={disabled}>
              {disabled ? "Saving…" : "Save changes"}
            </Button>

            {update.isSuccess && (
              <span className="text-sm text-muted-foreground">Saved.</span>
            )}

            {update.isError && (
              <span className="text-sm text-destructive">Update failed.</span>
            )}
          </div>
        </div>
      </form>

      {/* ✅ Password form (method 2, separate) */}
      <div className="bg-white p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Checkbox
            id="change-password"
            checked={changePassword}
            onCheckedChange={(v) => setChangePassword(Boolean(v))}
          />
          <Label htmlFor="change-password" className="text-sm font-medium">
            Change Password
          </Label>
        </div>

        {changePassword ? (
          <form onSubmit={onSubmitPassword} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Current password">
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  isPassword
                />
              </Field>

              <div className="hidden md:block" />

              <Field label="New password">
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  isPassword
                />
              </Field>

              <Field label="Confirm new password">
                <Input
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmNewPassword: e.target.value,
                    }))
                  }
                  isPassword
                />
              </Field>
            </div>

            {/* inside the password form actions area */}
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={passwordUpdate.isPending}>
                {passwordUpdate.isPending ? "Updating..." : "Update password"}
              </Button>

              {passwordUpdate.isError ? (
                <span className="text-sm text-destructive">Update failed.</span>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
