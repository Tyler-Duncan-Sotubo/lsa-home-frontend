"use client";

import Image from "next/image";
import { LoginForm } from "./login-form";
import { LoginPageContentV1 } from "@/config/types/pages/Account/login-page.types";

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

export function LoginVariantTwo({
  content,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  const header = content?.header;
  const marketing = content?.marketing;

  const img = marketing?.media?.image;
  const imgAlt = img?.alt ?? marketing?.heading ?? "Login";

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="grid w-full max-w-5xl overflow-hidden md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
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

        {/* Right image panel */}
        <div className="relative hidden md:block min-h-130 ">
          {img?.src ? (
            <>
              <Image
                src={img.src}
                alt={imgAlt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 0px"
              />
              {/* Optional overlay for readability if you later add text */}
              <div className="absolute inset-0 bg-black/10" />
            </>
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
      </div>
    </div>
  );
}
