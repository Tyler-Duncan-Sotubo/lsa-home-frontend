"use client";

import { useSearchParams } from "next/navigation";
import { useLogin } from "../hooks/use-login";
import { LoginVariantOne } from "./login-variant-one";
import { LoginVariantTwo } from "./login-variant-two";
import { AccountLoginPageConfigV1 } from "@/config/types/pages/Account/login-page.types";

export default function LoginClient({
  config,
}: {
  config: AccountLoginPageConfigV1;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const { login, error, isLoading } = useLogin(callbackUrl);

  const commonProps = {
    content: config.ui.content,
    error,
    isSubmitting: isLoading,
    onSubmit: (v: { email: string; password: string }) =>
      login(v.email, v.password),
  };

  switch (config.ui.variant) {
    case "V2":
      return <LoginVariantTwo {...commonProps} />;

    case "V1":
    default:
      return <LoginVariantOne {...commonProps} />;
  }
}
