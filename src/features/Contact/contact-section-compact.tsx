"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import type { ContactSectionV1 } from "@/config/types/contact.types";

type FieldKey = "name" | "email" | "phone" | "company" | "subject" | "message";

type CompactSection = ContactSectionV1 & {
  layout: Extract<ContactSectionV1["layout"], { variant: "compact" }>;
};

function buildSchema(fields: FieldKey[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (fields.includes("name")) {
    shape.name = z.string().min(2, "Please enter your full name");
  }

  if (fields.includes("email")) {
    shape.email = z.email("Please enter a valid email");
  }

  if (fields.includes("phone")) {
    shape.phone = z
      .string()
      .min(7, "Please enter a valid phone number")
      .optional();
  }

  if (fields.includes("company")) {
    shape.company = z.string().min(2, "Please enter a company name").optional();
  }

  if (fields.includes("subject")) {
    shape.subject = z
      .string()
      .min(2, "Please enter a subject")
      .max(120, "Subject is too long");
  }

  if (fields.includes("message")) {
    shape.message = z
      .string()
      .min(10, "Please add a bit more detail (10+ chars)");
  }

  return z.object(shape);
}

function defaultValues(fields: FieldKey[]) {
  const vals: Record<string, any> = {};
  for (const f of fields) vals[f] = "";
  return vals;
}

export function ContactSectionCompact({
  section,
  onSubmitContact,
}: {
  section?: ContactSectionV1;
  onSubmitContact?: (values: Record<string, any>) => Promise<void> | void;
}) {
  const compact: CompactSection | null =
    section && section.layout?.variant === "compact"
      ? (section as CompactSection)
      : null;

  const fields = React.useMemo(() => {
    const cfgFields = compact?.form?.fields;
    return (
      cfgFields?.length
        ? cfgFields
        : (["name", "email", "subject", "phone", "message"] as FieldKey[])
    ) as FieldKey[];
  }, [compact?.form?.fields]);

  const schema = React.useMemo(() => buildSchema(fields), [fields]);
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(fields) as any,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const showErrors = form.formState.submitCount > 0;

  // ✅ honeypot + disable-after-success
  const websiteRef = React.useRef<HTMLInputElement | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(values: Values) {
    if (submitted) return;

    // Honeypot: if bot filled hidden "website", pretend success
    const website = websiteRef.current?.value?.trim();
    if (website) {
      setSubmitted(true);
      form.reset(defaultValues(fields) as any);
      toast.success(
        compact?.form?.successMessage ?? "Thanks — we’ll reach out shortly."
      );
      return;
    }

    try {
      if (onSubmitContact) {
        await onSubmitContact(values as Record<string, any>);
      } else {
        // ✅ default: call internal Next API route
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            subject: (values as any)?.subject ?? "", // ✅ ensure included
            website: websiteRef.current?.value ?? "",
          }),
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.message ?? "Something went wrong. Please try again."
          );
        }
      }

      setSubmitted(true);
      form.reset(defaultValues(fields) as any);

      toast.success(
        compact?.form?.successMessage ?? "Thanks — we’ll reach out shortly."
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Something went wrong. Please try again.");
      form.setError("root" as any, {
        type: "server",
        message: "Something went wrong. Please try again.",
      });
    }
  }

  if (!compact) return null;

  const { title, subtitle, info, form: formCfg, layout } = compact;
  const image = layout.image;

  return (
    <section className="relative w-[95%] mx-auto py-20">
      <div className="mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          {title && (
            <h2 className="text-3xl font-heading font-semibold text-foreground">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-3 max-w-xl text-muted-foreground">{subtitle}</p>
          )}

          {info && (
            <div className="mt-6 space-y-1 text-sm text-muted-foreground">
              {info.phone?.map((p) => (
                <div key={p}>{p}</div>
              ))}
              {info.email?.map((e) => (
                <div key={e}>{e}</div>
              ))}
              {info.address && <div>{info.address}</div>}
              {info.hours && <div>{info.hours}</div>}
            </div>
          )}

          {formCfg?.enabled !== false && (
            <div className="mt-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  {/* ✅ Honeypot (hidden) */}
                  <input
                    ref={websiteRef}
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {/* Subject (full width) */}
                  {fields.includes("subject") && (
                    <FormField
                      control={form.control}
                      name={"subject" as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What can we help with?"
                              {...field}
                              value={field.value as string}
                              disabled={submitted}
                            />
                          </FormControl>
                          {showErrors && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Full name + Email (2 cols on md+) */}
                  {(fields.includes("name") || fields.includes("email")) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {fields.includes("name") && (
                        <FormField
                          control={form.control}
                          name={"name" as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value as string}
                                  disabled={submitted}
                                />
                              </FormControl>
                              {showErrors && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}

                      {fields.includes("email") && (
                        <FormField
                          control={form.control}
                          name={"email" as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  {...field}
                                  value={field.value as string}
                                  disabled={submitted}
                                />
                              </FormControl>
                              {showErrors && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {/* Company + Phone (2 cols on md+) */}
                  {(fields.includes("company") || fields.includes("phone")) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {fields.includes("company") && (
                        <FormField
                          control={form.control}
                          name={"company" as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your company (optional)"
                                  {...field}
                                  value={field.value as string}
                                  disabled={submitted}
                                />
                              </FormControl>
                              {showErrors && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}

                      {fields.includes("phone") && (
                        <FormField
                          control={form.control}
                          name={"phone" as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value as string}
                                  disabled={submitted}
                                />
                              </FormControl>
                              {showErrors && <FormMessage />}
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {/* Message (full width) */}
                  {fields.includes("message") && (
                    <FormField
                      control={form.control}
                      name={"message" as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us what you need (quantities, branding, delivery timeline...)"
                              rows={4}
                              {...field}
                              value={field.value as string}
                              disabled={submitted}
                              className="h-36 resize-none"
                            />
                          </FormControl>
                          {showErrors && <FormMessage />}
                        </FormItem>
                      )}
                    />
                  )}

                  {showErrors && form.formState.errors?.root?.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.root.message as string}
                    </p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitted || form.formState.isSubmitting}
                  >
                    {submitted
                      ? "Sent"
                      : form.formState.isSubmitting
                      ? "Sending..."
                      : formCfg?.submitLabel ?? "Send Request"}
                  </Button>

                  {formCfg?.privacyNote && (
                    <p className="text-xs text-muted-foreground">
                      {formCfg.privacyNote}
                    </p>
                  )}
                </form>
              </Form>
            </div>
          )}
        </div>

        <div className="relative hidden md:block aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 90vw"
          />
        </div>
      </div>
    </section>
  );
}
