"use client";

import { useSearchParams } from "next/navigation";
import { useRegister } from "../hooks/use-register";
import { RegisterVariantOne } from "./register-variant-one";
import { RegisterVariantTwo } from "./register-variant-two";
import { AccountRegisterPageConfigV1 } from "@/config/types/pages/Account/register-page.types";
import { RegisterFormValues } from "./register-form";

export default function RegisterClient({
  config,
}: {
  config: AccountRegisterPageConfigV1;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const { register, error } = useRegister(callbackUrl);

  const commonProps = {
    content: config.ui.content,
    error,
    onSubmit: (v: RegisterFormValues) => register(v),
  };

  switch (config.ui.variant) {
    case "V2":
      return <RegisterVariantTwo {...commonProps} />;

    case "V1":
    default:
      return <RegisterVariantOne {...commonProps} />;
  }
}
