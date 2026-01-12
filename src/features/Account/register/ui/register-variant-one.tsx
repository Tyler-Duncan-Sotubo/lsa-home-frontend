"use client";

import { RegisterPageContentV1 } from "@/config/types/pages/Account/register-page.types";
import { RegisterForm, RegisterFormValues } from "./register-form";

type Props = {
  content?: RegisterPageContentV1;
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  error?: string | null;
  isSubmitting?: boolean;
};

export function RegisterVariantOne({
  content,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  const header = content?.header;
  const marketing = content?.marketing;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[1.1fr_1fr]">
        {/* Left */}
        <div className="px-6 py-8 md:px-10 md:py-10">
          <div className="mb-6 space-y-2">
            {header?.eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {header.eyebrow}
              </p>
            )}
            {header?.heading && (
              <h1 className="text-2xl font-semibold">{header.heading}</h1>
            )}
            {header?.description && (
              <p className="text-sm text-muted-foreground">
                {header.description}
              </p>
            )}
          </div>

          <RegisterForm
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>

        {/* Right marketing */}
        {marketing && (
          <div className="hidden md:flex flex-col bg-linear-to-br from-primary/90 via-primary to-primary/80 px-8 py-8 text-primary-foreground">
            <div className="space-y-4">
              {marketing.badge && (
                <p className="inline-flex rounded-full bg-primary-foreground/10 px-3 py-1 text-xs uppercase tracking-widest">
                  {marketing.badge}
                </p>
              )}
              {marketing.heading && (
                <h2 className="text-2xl font-semibold">{marketing.heading}</h2>
              )}
              {marketing.description && (
                <p className="text-sm text-primary-foreground/80">
                  {marketing.description}
                </p>
              )}
            </div>

            {marketing.bullets?.length && (
              <div className="mt-6 space-y-4 text-sm">
                {marketing.bullets.map((b, i) => (
                  <div key={i}>
                    <p className="font-medium">{b.title}</p>
                    {b.description && (
                      <p className="text-xs text-primary-foreground/80">
                        {b.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {marketing.footerNote && (
              <p className="mt-6 text-[11px] text-primary-foreground/70">
                {marketing.footerNote}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
