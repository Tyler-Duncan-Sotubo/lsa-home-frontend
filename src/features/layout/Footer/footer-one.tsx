/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useRef, useState } from "react";
import type { StorefrontConfigV1 } from "@/config/types/types";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { SocialIcon } from "./social-icons";
import CopyrightBar from "./copyright-bar";
import { toast } from "sonner";

import { storefrontAxios } from "@/shared/api/axios-storefront";
import { getStoreHostHeader } from "@/shared/api/storefront-headers";

type Props = {
  config: StorefrontConfigV1;
  footer: NonNullable<StorefrontConfigV1["footer"]>;
};

export function FooterOne({ config, footer }: Props) {
  const year = new Date().getFullYear();
  const leftText = footer.bottomBar?.leftText?.replace("{year}", String(year));
  const paymentOptions = footer.bottomBar?.payments;
  const logoUrl = config?.theme?.assets?.logoUrl;

  // ----------------------------
  // Newsletter subscribe state
  // ----------------------------
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const websiteRef = useRef<HTMLInputElement | null>(null); // honeypot

  if (!footer) return null;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting || submitted) return;

    // Honeypot: if bot fills hidden field, pretend success
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

      // If backend uses { ok: true/false }
      if (json?.ok === false) {
        throw new Error(json?.message || "Subscription failed");
      }

      setSubmitted(true);
      setEmail("");
      toast.success("Thanks for subscribing!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
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
                <span className="text-sm font-semibold">
                  {config.store.name}
                </span>
              )}
            </Link>

            {footer.brand?.blurb && (
              <p className="max-w-sm text-sm text-slate-200/80">
                {footer.brand.blurb}
              </p>
            )}

            {/* Newsletter */}
            {footer.newsletter?.enabled && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                  {footer.newsletter.title ?? "Subscribe to our emails"}
                </h3>
                {footer.newsletter.description && (
                  <p className="text-sm text-slate-200/80">
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
                    className="bg-white/10 border-white/20 text-slate-100 placeholder:text-slate-200/60"
                    disabled={submitting || submitted}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
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
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                {footer.contacts.title ?? "Contacts"}
              </h2>
              <div className="space-y-3 text-sm text-slate-200/80">
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-slate-200/80">
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
      <summary className="flex cursor-pointer items-center justify-between py-2 text-sm font-semibold uppercase tracking-wide text-slate-200">
        <span>{title}</span>
        <span className="text-slate-400 text-lg leading-none">+</span>
      </summary>
      <ul className="mt-2 space-y-2 text-sm text-slate-200/80">
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
