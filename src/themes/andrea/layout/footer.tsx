"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { SocialIcon } from "@/themes/modave/layout/Footer/social-icons";
import CopyrightBar from "@/themes/modave/layout/Footer/copyright-bar";
import { storefrontAxios } from "@/shared/api/axios-storefront";
import { getStoreHostHeader } from "@/shared/api/storefront-headers";

type Props = {
  config: StorefrontConfigV1;
  footer: StorefrontConfigV1["footer"];
};

// andrea's own footer — same data (brand/columns/contacts/newsletter/
// social) as modave's FooterOne, since that's the layout Emilia's config
// is actually populated for, but the newsletter input/button use
// andrea's pill shape instead of the generic default styling.
// CopyrightBar/SocialIcon are reused as-is: fully generic, data-driven,
// nothing theme-specific to fork.
export function Footer({ config, footer }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const websiteRef = useRef<HTMLInputElement | null>(null); // honeypot

  if (!footer) return null;

  const year = new Date().getFullYear();
  const leftText = footer.bottomBar?.leftText?.replace("{year}", String(year));
  const paymentOptions = footer.bottomBar?.payments;
  const logoUrl = config?.theme?.assets?.logoUrl;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting || submitted) return;

    const website = websiteRef.current?.value?.trim();
    if (website) {
      setSubmitted(true);
      setEmail("");
      toast.success("Thanks for subscribing!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await storefrontAxios.post(
        "/api/mail/subscribe",
        {
          email,
          source: "footer",
          website: websiteRef.current?.value ?? "",
        },
        {
          headers: { ...(await getStoreHostHeader()) },
        },
      );

      const json = res.data;
      if (json?.ok === false) {
        throw new Error(json?.message || "Subscription failed");
      }

      setSubmitted(true);
      setEmail("");
      toast.success("Thanks for subscribing!");
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t bg-primary text-secondary">
      <div className="w-[95%] mx-auto flex flex-col gap-10 px-4 py-10 md:py-12 lg:py-16">
        {/* Top grid */}
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center">
              {footer.brand?.logoUrl ? (
                <Image
                  src={logoUrl || footer.brand.logoUrl}
                  alt={config.store.name}
                  width={90}
                  height={58}
                  className="h-auto w-22.5"
                />
              ) : (
                <span className="text-base font-semibold">
                  {config.store.name}
                </span>
              )}
            </Link>

            {footer.brand?.blurb && (
              <p className="max-w-sm text-base text-slate-200/80">
                {footer.brand.blurb}
              </p>
            )}

            {/* Newsletter */}
            {footer.newsletter?.enabled && (
              <div className="space-y-2 pt-2">
                <h3 className="font-heading text-xl font-normal text-slate-100">
                  {footer.newsletter.title ?? "Subscribe to our emails"}
                </h3>
                {footer.newsletter.description && (
                  <p className="text-base text-slate-200/80">
                    {footer.newsletter.description}
                  </p>
                )}

                <form
                  className="flex gap-2 max-w-sm"
                  onSubmit={handleSubscribe}
                >
                  {/* honeypot */}
                  <input
                    ref={websiteRef}
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={footer.newsletter.placeholder ?? "Email"}
                    className="bg-white/10 border-white/20 text-slate-100 placeholder:text-slate-200/60 rounded-tl-[15px]! rounded-br-[15px]! rounded-tr-none! rounded-bl-none!"
                    disabled={submitting || submitted}
                  />
                  <Button
                    type="submit"
                    variant="pillClean"
                    disabled={submitting || submitted || !email}
                  >
                    {submitted
                      ? "Subscribed"
                      : submitting
                        ? "Subscribing…"
                        : (footer.newsletter.ctaLabel ?? "Subscribe")}
                  </Button>
                </form>

                {/* Social */}
                {!!footer.social?.length && (
                  <div className="flex items-center gap-3 pt-2">
                    {footer.social.map((s) => (
                      <Link
                        key={`${s.platform}:${s.href}`}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.platform}
                        className="text-slate-200/80 hover:text-white transition"
                      >
                        <SocialIcon platform={s.platform} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: accordion */}
          <div className="space-y-3 md:hidden">
            {footer.columns?.map((col) => (
              <FooterAccordionColumn
                key={col.title}
                title={col.title}
                links={col.links}
              />
            ))}
          </div>

          {/* DESKTOP: columns */}
          {footer.columns?.map((col) => (
            <div key={col.title} className="hidden md:block">
              <FooterColumn title={col.title} links={col.links} />
            </div>
          ))}

          {/* Contacts */}
          {footer.contacts?.lines?.length ? (
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <h2 className="font-heading text-xl font-normal text-slate-100">
                {footer.contacts.title ?? "Contacts"}
              </h2>
              <div className="space-y-3 text-base text-slate-200/80">
                {footer.contacts.lines.map((line, i) => (
                  <p key={`${line}:${i}`}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom bar */}
        <CopyrightBar
          leftText={leftText}
          payments={paymentOptions}
          year={year}
          config={config}
        />
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: { href: string; label: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl font-normal text-slate-100">
        {title}
      </h2>
      <ul className="space-y-2 text-base text-slate-200/80">
        {links.map((link) => (
          <li key={`${link.href}:${link.label}`}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterAccordionColumn({ title, links }: FooterColumnProps) {
  return (
    <details className="border-b border-b-teal-50 pb-2">
      <summary className="flex cursor-pointer items-center justify-between py-2 font-heading text-xl font-normal text-slate-100">
        <span>{title}</span>
        <span className="text-slate-400 text-lg leading-none">+</span>
      </summary>
      <ul className="mt-2 space-y-2 text-base text-slate-200/80">
        {links.map((link) => (
          <li key={`${link.href}:${link.label}`}>
            <Link href={link.href} className="block py-1 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
