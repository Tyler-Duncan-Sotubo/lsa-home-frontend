"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";

export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  marketingOptIn: boolean;
};

type Props = {
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  error?: string | null;
  isSubmitting?: boolean;
};

export function RegisterForm({ onSubmit, error, isSubmitting }: Props) {
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      marketingOptIn: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
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
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{ required: "Password is required", minLength: 6 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketingOptIn"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={(checked) =>
                    field.onChange(Boolean(checked))
                  }
                />
              </FormControl>

              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">
                  Subscribe to marketing emails
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  Get early access to launches, special offers, and member-only
                  promotions. You can unsubscribe anytime.
                </p>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          isLoading={!!isSubmitting}
          loadingText="Creating account..."
        >
          Create account
        </Button>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/account/login"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Sign in instead.
          </Link>
        </p>
      </form>
    </Form>
  );
}
