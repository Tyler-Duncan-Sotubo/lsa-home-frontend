"use client";

import { useState } from "react";
import type { FooterConfigV1 } from "@/config/types/footer.types";
import { WhatsAppPopup } from "./whats-app-popup";
import { WhatsAppButton } from "./whats-app-button";

export function WhatsAppWidget({
  config,
}: {
  config?: FooterConfigV1["whatsapp"];
}) {
  const [open, setOpen] = useState(false);

  if (!config?.enabled) return null;

  const toggle = () => setOpen((v) => !v);

  return (
    <>
      {open && <WhatsAppPopup config={config} onClose={() => setOpen(false)} />}
      <WhatsAppButton config={config} open={open} onClick={toggle} />
    </>
  );
}
