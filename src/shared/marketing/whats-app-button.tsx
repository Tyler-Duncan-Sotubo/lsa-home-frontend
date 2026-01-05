"use client";

import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineXMark } from "react-icons/hi2";
import type { FooterConfigV1 } from "@/config/types/footer.types";

export function WhatsAppButton({
  config,
  open,
  onClick,
}: {
  config: NonNullable<FooterConfigV1["whatsapp"]>;
  open: boolean;
  onClick: () => void;
}) {
  if (!config.enabled) return null;

  const positionClass =
    config.position === "bottom-left" ? "left-6" : "right-6";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close WhatsApp" : "Chat on WhatsApp"}
      aria-expanded={open}
      className={`
        fixed bottom-6 ${positionClass} z-50
        flex h-14 w-14 items-center justify-center
        rounded-full text-white shadow-lg transition
        ${
          open
            ? "bg-green-500 hover:bg-green-800"
            : "bg-green-500 hover:bg-green-600"
        }
        hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-green-400
        cursor-pointer
      `}
    >
      {open ? (
        <HiOutlineXMark className="h-7 w-7" />
      ) : (
        <FaWhatsapp className="h-7 w-7" />
      )}
    </button>
  );
}
