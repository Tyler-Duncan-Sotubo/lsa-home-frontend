"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { storefrontAxios } from "@/shared/api/axios-storefront";
import { getStoreHostHeader } from "@/shared/api/storefront-headers";
import type { ContactSectionV1 } from "@/config/types/contact.types";

type FieldKey = "name" | "email" | "phone" | "company" | "subject" | "message";

type FullSection = ContactSectionV1 & {
  layout: Extract<ContactSectionV1["layout"], { variant: "full" }>;
};

type StackedSection = ContactSectionV1 & {
  layout: Extract<ContactSectionV1["layout"], { variant: "stacked" }>;
};

function buildSchema(fields: FieldKey[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (fields.includes("name"))
    shape.name = z.string().min(2, "Please enter your full name");
  if (fields.includes("email"))
    shape.email = z.email("Please enter a valid email");
  if (fields.includes("phone"))
    shape.phone = z
      .string()
      .min(7, "Please enter a valid phone number")
      .optional();
  if (fields.includes("company"))
    shape.company = z.string().min(2, "Please enter a company name").optional();
  if (fields.includes("subject"))
    shape.subject = z.string().min(2, "Please enter a subject");
  if (fields.includes("message"))
    shape.message = z
      .string()
      .min(10, "Please add a bit more detail (10+ chars)");

  return z.object(shape);
}

function defaultValues(fields: FieldKey[]) {
  const vals: Record<string, any> = {};
  for (const f of fields) vals[f] = "";
  return vals;
}

function normalizePhone(p?: string | string[]) {
  if (!p) return "";

  const value = Array.isArray(p) ? p[0] : p;
  return typeof value === "string" ? value.replace(/\s+/g, "") : "";
}

function titleCase(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function ContactSection({
  section,
  onSubmitContact,
}: {
  section?: ContactSectionV1;
  onSubmitContact?: (values: Record<string, any>) => Promise<void> | void;
}) {
  const variant = section?.layout?.variant;
  const isSupported = variant === "full" || variant === "stacked";

  const cfg = (isSupported ? (section as any) : null) as
    | FullSection
    | StackedSection
    | null;

  const fields = React.useMemo(() => {
    const cfgFields = cfg?.form?.fields;
    return (
      cfgFields?.length
        ? cfgFields
        : (["name", "email", "subject", "phone", "message"] as FieldKey[])
    ) as FieldKey[];
  }, [cfg?.form?.fields]);

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

    const website = websiteRef.current?.value?.trim();
    if (website) {
      setSubmitted(true);
      form.reset(defaultValues(fields) as any);
      toast.success(
        cfg?.form?.successMessage ?? "Thanks — we’ll reach out shortly.",
      );
      return;
    }

    try {
      if (onSubmitContact) {
        await onSubmitContact(values as Record<string, any>);
      } else {
        const res = await storefrontAxios.post(
          "/api/mail/contact",
          {
            ...values,
            subject: (values as any)?.subject ?? "",
            website: websiteRef.current?.value ?? "",
          },
          {
            // ✅ critical: matches your shop page pattern
            headers: { ...(await getStoreHostHeader()) },
          },
        );

        const json = res.data;
        // if backend returns { ok: true/false }
        if (json?.ok === false) {
          throw new Error(
            json?.message ?? "Something went wrong. Please try again.",
          );
        }
      }

      setSubmitted(true);
      form.reset(defaultValues(fields) as any);

      toast.success(
        cfg?.form?.successMessage ?? "Thanks — we’ll reach out shortly.",
      );
    } catch (e: any) {
      console.error(e);

      // Axios error message extraction
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "Something went wrong. Please try again.";

      toast.error(msg);
      form.setError("root" as any, { type: "server", message: msg });
    }
  }

  if (!cfg) return null;

  const { title, subtitle, info, form: formCfg, layout } = cfg;

  const phone0 = info?.phone?.[0];
  const email0 = info?.email?.[0];
  const wa = info?.whatsapp;

  const mapEnabled = layout.map?.enabled ?? Boolean(layout.map?.embedUrl);
  const mapUrl = layout.map?.embedUrl;
  const mapTitle = layout.map?.title ?? "Map";
  const mapHeight = layout.map?.heightClassName ?? "h-[360px]";

  const Details = (
    <div>
      {title && (
        <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
      )}

      {info && (
        <div className="mt-6 space-y-4 text-base">
          {!!phone0 && (
            <div>
              <div className="font-medium text-foreground">Phone</div>
              <a
                className="underline underline-offset-4"
                href={`tel:${normalizePhone(phone0)}`}
              >
                {phone0}
              </a>
            </div>
          )}

          {!!email0 && (
            <div>
              <div className="font-medium text-foreground">Email</div>
              <a
                className="underline underline-offset-4"
                href={`mailto:${email0}`}
              >
                {email0}
              </a>
            </div>
          )}

          {!!wa && (
            <div>
              <div className="font-medium text-foreground">WhatsApp</div>
              <a
                className="underline underline-offset-4"
                href={`https://wa.me/${normalizePhone(wa).replace(/^\+/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp
              </a>
            </div>
          )}

          {info.locations?.length ? (
            <div className="space-y-3">
              <div className="font-medium text-foreground">Address</div>
              {info.locations.map((loc) => (
                <div key={loc.label}>
                  <div className="text-sm font-semibold text-foreground">
                    {loc.label}
                  </div>
                  <div className="text-muted-foreground">{loc.address}</div>
                </div>
              ))}
            </div>
          ) : (
            info.address && (
              <div>
                <div className="font-medium text-foreground">Address</div>
                <div className="text-muted-foreground">{info.address}</div>
              </div>
            )
          )}

          {info.social?.length ? (
            <div className="space-y-2">
              {info.social.map((s) => (
                <div key={`${s.platform}-${s.handle ?? s.href ?? ""}`}>
                  <div className="font-medium text-foreground">
                    {titleCase(s.platform)}
                  </div>
                  {s.href ? (
                    <a
                      className="underline underline-offset-4 text-muted-foreground"
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.handle ?? s.label ?? s.href}
                    </a>
                  ) : (
                    <div className="text-muted-foreground">
                      {s.handle ?? s.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {info.hours && (
            <div>
              <div className="font-medium text-foreground">Hours</div>
              <div className="text-muted-foreground">{info.hours}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const FormBlock =
    formCfg?.enabled === false ? null : (
      <div className="w-full mb-20 rounded-lg bg-secondary shadow-md p-8">
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
                        {...field}
                        value={field.value as string}
                        className="bg-white"
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
                            className="bg-white"
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
                            className="bg-white"
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
                            {...field}
                            value={field.value as string}
                            className="bg-white"
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
                            className="bg-white"
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
                        rows={5}
                        {...field}
                        value={field.value as string}
                        className="bg-white h-36 resize-none"
                        disabled={submitted}
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
                  : (formCfg?.submitLabel ?? "Send Message")}
            </Button>

            {formCfg?.privacyNote && (
              <p className="text-xs text-muted-foreground">
                {formCfg.privacyNote}
              </p>
            )}
          </form>
        </Form>
      </div>
    );

  const MapBlock =
    mapEnabled && mapUrl ? (
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className={["w-full", mapHeight].join(" ")}>
          <iframe
            title={mapTitle}
            src={mapUrl}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    ) : null;

  // ---------------------------
  // RENDER: FULL
  // ---------------------------
  if (layout.variant === "full") {
    const topColumns = layout.top?.columns ?? 2;
    const topOrder = layout.top?.order ?? (["details", "form"] as const);
    const topGap = layout.top?.gapClassName ?? "gap-10";

    const renderTop = (key: (typeof topOrder)[number]) => {
      if (key === "details") return Details;
      if (key === "form") return FormBlock;
      return null;
    };

    return (
      <section className="relative w-[95%] mx-auto py-16 md:py-20" id="contact">
        <div className={layout.containerClassName ?? ""}>
          <div
            className={[
              "grid items-start",
              topGap,
              topColumns === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
            ].join(" ")}
          >
            {topOrder.map((k) => (
              <React.Fragment key={k}>{renderTop(k)}</React.Fragment>
            ))}
          </div>

          {MapBlock ? <div className="mt-12">{MapBlock}</div> : null}
        </div>
      </section>
    );
  }

  // ---------------------------
  // RENDER: STACKED
  // ---------------------------
  if (layout.variant === "stacked") {
    const formRowEnabled = layout.formRow?.enabled ?? true;
    const formRowMax = layout.formRow?.containerClassName ?? "max-w-3xl";

    const cols = layout.bottomGrid?.columns ?? 2;
    const order = layout.bottomGrid?.order ?? (["details", "map"] as const);
    const gap = layout.bottomGrid?.gapClassName ?? "gap-10";

    const renderBottom = (k: (typeof order)[number]) => {
      if (k === "details") return Details;
      if (k === "map") return MapBlock;
      return null;
    };

    return (
      <section
        className="relative w-[90%] md:w-full mx-auto pb-10 space-y-10"
        id="contact"
      >
        <div className={layout.containerClassName ?? "container mx-auto "}>
          {formRowEnabled && FormBlock ? (
            <div className={`mx-auto  ${formRowMax}`}>{FormBlock}</div>
          ) : null}

          <div
            className={[
              "mt-12 grid items-start",
              gap,
              cols === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
            ].join(" ")}
          >
            {order.map((k) => (
              <React.Fragment key={k}>{renderBottom(k)}</React.Fragment>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
