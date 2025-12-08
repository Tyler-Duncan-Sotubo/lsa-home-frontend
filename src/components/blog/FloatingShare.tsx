/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaMailBulk,
  FaShare,
  FaFacebook,
  FaLink,
  FaLinkedin,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

type Props = {
  url?: string;
  title: string;
  summary?: string;
  tags?: string[];
  offsetTop?: number;
};

export default function FloatingShare({
  url,
  title,
  summary,
  tags = [],
  offsetTop = 260,
}: Props) {
  const [href, setHref] = useState(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  });
  const hashtags = tags.map((t) => t.replace(/\s+/g, "")).join(",");

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHref(window.location.href);
    }
  }, [url]);

  const encoded = useMemo(
    () => ({
      url: encodeURIComponent(href),
      text: encodeURIComponent(title),
      summary: encodeURIComponent(summary ?? ""),
      hashtags: encodeURIComponent(hashtags),
    }),
    [href, title, summary, hashtags]
  );

  function openShare(u: string) {
    window.open(u, "_blank", "noopener,noreferrer,width=700,height=560");
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title,
          text: summary ?? title,
          url: href,
        });
      } catch {
        // user cancelled
      }
    } else {
      openShare(
        `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}&hashtags=${encoded.hashtags}`
      );
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(href);
      alert("Link copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Link copied!");
    }
  }

  // 🎨 brand colors
  const colors = {
    X: "#000000",
    LinkedIn: "#0A66C2",
    Facebook: "#1877F2",
    WhatsApp: "#25D366",
    Email: "#EA4335",
    Copy: "#6B7280", // neutral gray
  };

  // Share endpoints
  const links = [
    {
      label: "X",
      icon: <FaTwitter className="h-5 w-5" />,
      color: colors.X,
      onClick: () =>
        openShare(
          `https://twitter.com/intent/tweet?text=${encoded.text}&url=${encoded.url}&hashtags=${encoded.hashtags}`
        ),
    },
    {
      label: "LinkedIn",
      icon: <FaLinkedin className="h-5 w-5" />,
      color: colors.LinkedIn,
      onClick: () =>
        openShare(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`
        ),
    },
    {
      label: "Facebook",
      icon: <FaFacebook className="h-5 w-5" />,
      color: colors.Facebook,
      onClick: () =>
        openShare(
          `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`
        ),
    },
    {
      label: "WhatsApp",
      icon: <FaWhatsapp className="h-5 w-5" />,
      color: colors.WhatsApp,
      onClick: () =>
        openShare(
          `https://api.whatsapp.com/send?text=${encoded.text}%20${encoded.url}`
        ),
    },
    {
      label: "Email",
      icon: <FaMailBulk className="h-5 w-5" />,
      color: colors.Email,
      onClick: () =>
        window.location.assign(
          `mailto:?subject=${encoded.text}&body=${encoded.summary}%0A%0A${encoded.url}`
        ),
    },
  ];

  return (
    <>
      {/* 🖥️ Desktop floating bar */}
      <aside
        className="fixed left-2 top-[30vh] hidden lg:block z-1000"
        style={{ marginTop: offsetTop }}
        aria-label="Share this post"
      >
        <div className="flex flex-col gap-2 rounded-xl border bg-background/80 backdrop-blur p-2 shadow-sm">
          <button
            onClick={nativeShare}
            className="inline-flex items-center justify-center rounded-md p-3 hover:bg-muted"
            title="Share"
            aria-label="Share"
          >
            <FaShare className="h-5 w-5 text-gray-700" />
          </button>

          {links.map((l) => (
            <button
              key={l.label}
              onClick={l.onClick}
              className="inline-flex items-center justify-center rounded-md p-3 hover:bg-muted transition-colors"
              title={`Share on ${l.label}`}
              aria-label={`Share on ${l.label}`}
            >
              <span style={{ color: l.color }}>{l.icon}</span>
            </button>
          ))}

          <button
            onClick={copyLink}
            className="mt-1 inline-flex items-center justify-center rounded-md p-3 hover:bg-muted transition-colors"
            title="Copy link"
            aria-label="Copy link"
          >
            <FaLink className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </aside>

      {/* 📱 Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
        <div className="mx-auto w-full max-w-md rounded-full border bg-background/95 backdrop-blur shadow-lg">
          <div className="flex items-center justify-between px-2">
            <button
              onClick={nativeShare}
              className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-muted rounded-full"
              aria-label="Share"
            >
              <FaShare className="h-5 w-5 text-gray-700" />
              Share
            </button>

            <div className="h-8 w-px bg-border" />

            <div className="flex flex-1 items-center justify-evenly py-3">
              {links.slice(0, 3).map((l) => (
                <button
                  key={l.label}
                  onClick={l.onClick}
                  className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                  aria-label={`Share on ${l.label}`}
                  title={l.label}
                >
                  <span style={{ color: l.color }}>{l.icon}</span>
                </button>
              ))}

              <button
                onClick={copyLink}
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                aria-label="Copy link"
                title="Copy link"
              >
                <FaLink className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
