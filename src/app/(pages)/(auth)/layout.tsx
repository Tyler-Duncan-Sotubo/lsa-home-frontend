// app/(auth)/layout.tsx
import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect("/account");
  }

  return <>{children}</>;
}
