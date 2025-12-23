"use client";

import Link from "next/link";
import Image from "next/image";
import {
  companyLinks,
  customerCareLinks,
  shopLinks,
} from "../config/footer-data";

export function SiteFooter() {
  return (
    <footer className="border-t bg-primary-foreground text-slate-100">
      <div className="w-[95%] mx-auto flex flex-col gap-10 px-4 py-10 md:py-12 lg:py-16">
        {/* Top grid */}
        <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Logo + intro (always visible) */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="https://lsahome.co/cdn/shop/files/LSA-final-logo-transparent-white.png?v=1717590888"
                alt="LSA HOME"
                width={90}
                height={58}
                className="h-auto w-[90px]"
              />
            </Link>
            <p className="max-w-sm text-sm text-slate-200/80">
              LSA Home is your one stop shop for premium bed and bath
              furnishings and accessories that help to elevate your comfort and
              well being.
            </p>
          </div>

          {/* MOBILE: accordion for link sections */}
          <div className="space-y-3 md:hidden">
            <FooterAccordionColumn title="Shop" links={shopLinks} />
            <FooterAccordionColumn
              title="Customer Care"
              links={customerCareLinks}
            />
            <FooterAccordionColumn title="Company" links={companyLinks} />
          </div>

          {/* DESKTOP: normal columns */}
          <div className="hidden md:block">
            <FooterColumn title="Shop" links={shopLinks} />
          </div>
          <div className="hidden md:block">
            <FooterColumn title="Customer Care" links={customerCareLinks} />
          </div>
          <div className="hidden md:block">
            <FooterColumn title="Company" links={companyLinks} />
          </div>

          {/* Contacts (always visible, not in accordion) */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Contacts
            </h2>
            <div className="space-y-3 text-sm text-slate-200/80">
              <p>+2348097148669</p>
              <p>Mon - Sat 9am - 6pm</p>
              <p>info@lsahome.co</p>
              <p>
                Plot 8B, Omorinre Johnson Street, Lekki phase 1, Lagos Nigeria
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} LSA Home. All rights reserved.</p>
          <p className="text-xs">
            Designed for better sleep, comfort &amp; wellbeing.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  links: { href: string; label: string }[];
}

/** Desktop version: simple column */
function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-slate-200/80">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mobile version: accordion with details/summary */
function FooterAccordionColumn({ title, links }: FooterColumnProps) {
  return (
    <details className="border-b border-b-teal-50 pb-2">
      <summary className="flex cursor-pointer items-center justify-between py-2 text-sm font-semibold uppercase tracking-wide text-slate-200">
        <span>{title}</span>
        <span className="text-slate-400 text-lg leading-none">+</span>
      </summary>
      <ul className="mt-2 space-y-2 text-sm text-slate-200/80">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block py-1 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
