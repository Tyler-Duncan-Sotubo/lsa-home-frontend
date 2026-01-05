"use client";

import Link from "next/link";
import { useState } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import type { FooterConfigV1 } from "@/config/types/footer.types";

export function WhatsAppPopup({
  config,
  onClose,
}: {
  config: NonNullable<FooterConfigV1["whatsapp"]>;
  onClose: () => void;
}) {
  // User-typed message
  const [message, setMessage] = useState("");

  const title = config.title ?? "Start a Conversation";
  const intro =
    config.intro ?? "Hi! Click one of our members below to chat on WhatsApp.";
  const note = config.note ?? "The team typically replies in a few minutes.";
  const agents = config.agents ?? [];

  if (!config.enabled) return null;

  const sanitizePhone = (phone: string) => phone.replace(/\D/g, "");

  const makeHref = (phone: string, text?: string) => {
    const base = `https://wa.me/${sanitizePhone(phone)}`;
    if (!text) return base;
    return `${base}?text=${encodeURIComponent(text)}`;
  };

  const openWhatsApp = (phone: string, agentPrefill?: string) => {
    // Priority: user typed message > agent prefill > empty
    const text = message.trim() || agentPrefill || "";
    const href = makeHref(phone, text);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-90 rounded-lg bg-white shadow-xl">
      <div className="flex items-center justify-between rounded-t-lg bg-green-500 px-4 py-3 text-white">
        <FaWhatsapp className="h-7 w-7" />
        <span className="font-semibold">{title}</span>
        <button onClick={onClose} aria-label="Close WhatsApp popup">
          <FaTimes />
        </button>
      </div>

      <div className="space-y-4 px-4 py-6">
        <div className="space-y-2">
          <p className="text-sm">{intro}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>

        {/* Message input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Your message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Type your message…"
            className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid gap-2">
          {agents.map((a) => (
            <div
              key={`${a.phone}-${a.name}`}
              className="flex items-stretch justify-between gap-2 rounded-xl border p-3"
            >
              {/* Agent info (click opens WhatsApp with either typed msg or agent prefill) */}
              <Link
                href={makeHref(a.phone, message.trim() || a.prefill)}
                target="_blank"
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                  <FaWhatsapp />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{a.name}</p>
                  {a.role ? (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {a.role}
                    </p>
                  ) : null}
                </div>
              </Link>

              {/* Explicit send button */}
              <button
                type="button"
                onClick={() => openWhatsApp(a.phone, a.prefill)}
                className="shrink-0 rounded-xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600 transition"
                aria-label={`Send message to ${a.name} on WhatsApp`}
              >
                Send
              </button>
            </div>
          ))}
        </div>

        {/* Optional: fallback if no agents */}
        {agents.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No WhatsApp agents configured.
          </p>
        ) : null}
      </div>
    </div>
  );
}
