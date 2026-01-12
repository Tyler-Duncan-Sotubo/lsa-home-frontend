"use client";

import { LoginPageContentV1 } from "@/config/types/pages/Account/login-page.types";
import { LoginForm } from "./login-form";

type LoginFormValues = {
  email: string;
  password: string;
};

type Props = {
  content?: LoginPageContentV1;
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  error?: string | null;
  isSubmitting?: boolean;
};

export function LoginVariantOne({
  content,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  const header = content?.header;
  const marketing = content?.marketing;

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-xl md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left */}
        <div className="px-6 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="mb-6 space-y-2">
            {header?.eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {header.eyebrow}
              </p>
            )}

            {header?.heading && (
              <h1 className="text-2xl font-semibold tracking-tight">
                {header.heading}
              </h1>
            )}

            {header?.description && (
              <p className="text-sm text-muted-foreground">
                {header.description}
              </p>
            )}
          </div>

          <LoginForm
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>

        {/* Right marketing panel */}
        <div className="hidden flex-col justify-between bg-linear-to-br from-primary/90 via-primary to-primary/80 px-8 py-8 text-primary-foreground md:flex">
          <div className="space-y-4">
            {marketing?.badge && (
              <p className="inline-flex items-center rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase">
                {marketing.badge}
              </p>
            )}

            {marketing?.heading && (
              <h2 className="text-2xl font-semibold leading-tight">
                {marketing.heading}
              </h2>
            )}

            {marketing?.description && (
              <p className="text-sm text-primary-foreground/80">
                {marketing.description}
              </p>
            )}
          </div>

          {marketing?.bullets?.length ? (
            <div className="mt-6 space-y-4 text-sm">
              {marketing.bullets.map((b, i) => (
                <div key={`${b.title}-${i}`} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/10 text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{b.title}</p>
                    {b.description && (
                      <p className="text-xs text-primary-foreground/80">
                        {b.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {marketing?.footerNote && (
            <p className="mt-6 text-[11px] text-primary-foreground/70">
              {marketing.footerNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
