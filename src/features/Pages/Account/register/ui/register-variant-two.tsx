"use client";

import Image from "next/image";
import { RegisterForm, RegisterFormValues } from "./register-form";
import { RegisterPageContentV1 } from "@/config/types/pages/Account/register-page.types";

type Props = {
  content?: RegisterPageContentV1;
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  error?: string | null;
  isSubmitting?: boolean;
};

export function RegisterVariantTwo({
  content,
  onSubmit,
  error,
  isSubmitting,
}: Props) {
  const header = content?.header;
  const marketing = content?.marketing;
  const image = marketing?.media?.image;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl overflow-hidden md:grid-cols-[1.1fr_1fr]">
        {/* Left */}
        <div className="px-6 py-8 md:px-10 md:py-12">
          <div className="mb-6 space-y-2">
            {header?.eyebrow && (
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
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

        {/* Right image */}
        <div className="relative hidden md:block min-h-150">
          {image?.src ? (
            <>
              <Image
                src={image.src}
                alt={image.alt ?? "Register"}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 0px"
              />
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
