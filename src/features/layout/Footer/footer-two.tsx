/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { StorefrontConfigV1 } from "@/config/types/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import Link from "next/link";
import { SocialIcon } from "./social-icons";
import CopyrightBar from "./copyright-bar";
import { storefrontAxios } from "@/shared/api/axios-storefront";
import { getStoreHostHeader } from "@/shared/api/storefront-headers";

type Props = {
  config: StorefrontConfigV1;
  footer: NonNullable<StorefrontConfigV1["footer"]>;
};

export function FooterTwo({ config, footer }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // honeypot (bots often fill hidden fields)
  const websiteRef = useRef<HTMLInputElement | null>(null);
  if (!footer.newsletter?.enabled) return null;

  const year = new Date().getFullYear();
  const leftText = footer.bottomBar?.leftText?.replace("{year}", String(year));
  const paymentOptions = footer.bottomBar?.payments;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading || submitted) return;

    // Honeypot check (if filled, silently succeed)
    const website = websiteRef.current?.value?.trim();
    if (website) {
      setSubmitted(true);
      setEmail("");
      toast.success("Thanks for subscribing!");
      return;
    }

    setLoading(true);

    try {
      const res = await storefrontAxios.post(
        "/api/mail/subscribe",
        {
          email,
          source: "footer",
          website: websiteRef.current?.value ?? "", // optional honeypot
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
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Something went wrong. Please try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="border-t bg-primary text-slate-100 pb-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-14 text-center">
        <h2 className="text-3xl font-semibold">
          {footer.newsletter.title ?? "Subscribe"}
        </h2>

        {footer.newsletter.description && (
          <p className="text-lg text-slate-200/80">
            {footer.newsletter.description}
          </p>
        )}

        <form className="flex w-full max-w-md gap-2" onSubmit={handleSubscribe}>
          {/* Honeypot field (hidden) */}
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
            disabled={loading || submitted}
          />

          <Button variant="secondary" disabled={loading || submitted}>
            {submitted
              ? "Subscribed"
              : loading
                ? "Subscribing..."
                : (footer.newsletter.ctaLabel ?? "Subscribe")}
          </Button>
        </form>

        {!!footer.social?.length && (
          <div className="flex items-center gap-4 pt-4">
            {footer.social.map((s) => (
              <Link
                key={s.platform}
                href={s.href}
                target="_blank"
                className="opacity-80 hover:opacity-100 transition"
              >
                <SocialIcon platform={s.platform} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <CopyrightBar
        leftText={leftText}
        payments={paymentOptions}
        year={year}
        config={config}
      />
    </footer>
  );
}
