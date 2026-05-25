// local-gallery.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  LocalGallerySectionV1,
  LocalGalleryItemV1,
} from "@/config/types/pages/Home/home-sections.types";
import { Play, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryApiItem {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  instagramUrl?: string;
  poster?: string;
  uploadedAt: string;
}

type GalleryItem = LocalGalleryItemV1 | GalleryApiItem;
type Status = "loading" | "live" | "seed";

// ─── Utils ────────────────────────────────────────────────────────────────────

function isVideo(item: GalleryItem) {
  return item.type === "video";
}

function getPoster(item: GalleryItem): string | undefined {
  return "poster" in item ? item.poster : undefined;
}

function getInstagramUrl(item: GalleryItem): string | undefined {
  return "instagramUrl" in item ? item.instagramUrl : undefined;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid({ count, gap }: { count: number; gap: string }) {
  return (
    <div
      className="grid mx-auto w-full max-w-7xl px-4"
      style={{ gridTemplateColumns: "repeat(3, 1fr)", gap }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100"
        />
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function GalleryModal({
  items,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[activeIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const instagramUrl = getInstagramUrl(item);
  const poster = getPoster(item);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
        aria-label="Close"
      >
        <X size={40} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute cursor-pointer left-3 md:left-6 z-10 text-white/70 hover:text-white transition-colors p-2 disabled:opacity-20"
        disabled={activeIndex === 0}
        aria-label="Previous"
      >
        <ChevronLeft size={60} />
      </button>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute cursor-pointer right-3 md:right-6 z-10 text-white/70 hover:text-white transition-colors p-2 disabled:opacity-20"
        disabled={activeIndex === items.length - 1}
        aria-label="Next"
      >
        <ChevronRight size={60} />
      </button>

      {/* Card */}
      <div
        className="relative z-10 flex flex-col md:flex-row bg-white w-full max-w-5xl max-h-[90svh] overflow-hidden mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative w-full md:w-[60%] aspect-square shrink-0 bg-black">
          {isVideo(item) ? (
            <video
              ref={videoRef}
              src={item.url}
              poster={poster}
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <Image
              src={item.url}
              alt={item.caption ?? `Gallery image ${activeIndex + 1}`}
              fill
              className="object-contain"
              unoptimized={item.url.startsWith("http")}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6 md:p-8 overflow-y-auto md:w-[40%]">
          {/* Profile row */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <FaInstagram className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 leading-none">
                Emilia Duncan
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {"uploadedAt" in item && item.uploadedAt
                  ? new Date(item.uploadedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </p>
            </div>
          </div>

          {/* Caption */}
          {item.caption ? (
            <p className="text-sm text-neutral-700 leading-relaxed flex-1">
              {item.caption}
            </p>
          ) : (
            <p className="text-sm text-neutral-300 italic flex-1">No caption</p>
          )}

          {/* Counter */}
          <p className="text-xs text-neutral-300 tracking-widest uppercase mt-6">
            {activeIndex + 1} / {items.length}
          </p>

          {/* Instagram link */}
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors border-b border-neutral-200 hover:border-neutral-900 pb-0.5 w-fit"
            >
              <FaInstagram className="w-3.5 h-3.5" />
              View on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

function Tile({
  item,
  index,
  hovered,
  onEnter,
  onLeave,
  onClick,
}: {
  item: GalleryItem;
  index: number;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const poster = getPoster(item);

  useEffect(() => {
    if (!videoRef.current) return;
    if (hovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovered]);

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Media */}
      {isVideo(item) ? (
        <video
          ref={videoRef}
          src={item.url}
          poster={poster}
          muted
          loop
          playsInline
          className={`w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            hovered ? "scale-[1.04]" : "scale-100"
          }`}
        />
      ) : (
        <Image
          src={item.url}
          alt={item.caption ?? `Gallery image ${index + 1}`}
          fill
          sizes="(max-width: 640px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
            hovered ? "scale-[1.06]" : "scale-100"
          }`}
          unoptimized={item.url.startsWith("http")}
        />
      )}

      {/* Video play badge — visible when not hovered */}
      {isVideo(item) && !hovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/30 border border-white/50 flex items-center justify-center text-white backdrop-blur-sm">
            <Play />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 p-4 transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {item.caption && (
          <p className="text-white text-[0.78rem] text-center leading-relaxed line-clamp-3">
            {item.caption.length > 80
              ? item.caption.slice(0, 80) + "…"
              : item.caption}
          </p>
        )}
        <span className="text-white/60 text-[0.65rem] tracking-widest uppercase mt-1">
          Tap to expand
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  config: LocalGallerySectionV1;
}

export default function LocalGallery({ config }: Props) {
  const {
    title,
    subtitle,
    handle,
    ctaLabel = "View Full Gallery",
    ctaHref,
    maxItems = 9,
    layout,
    seed = [],
  } = config;

  const gap = layout?.gap ?? "4px";

  // Seed is the source of truth — no API call needed
  // Skeleton shows briefly on mount so images have time to load
  const [ready, setReady] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const items = seed.slice(0, maxItems);

  useEffect(() => {
    // Single rAF so the skeleton flashes just long enough
    // for the browser to start loading images, then reveals the grid
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const openModal = useCallback((index: number) => setModalIndex(index), []);
  const closeModal = useCallback(() => setModalIndex(null), []);
  const prevModal = useCallback(
    () => setModalIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  );
  const nextModal = useCallback(
    () =>
      setModalIndex((i) => (i !== null && i < items.length - 1 ? i + 1 : i)),
    [items.length],
  );

  if (config.enabled === false) return null;

  return (
    <>
      <section className="w-full max-w-7xl mx-auto py-16">
        {/* ── Header ── */}
        <div className="text-center mb-10 px-6">
          {handle && (
            <div className="inline-flex items-center gap-1.5 text-[0.75rem] tracking-[0.14em] uppercase text-neutral-400 mb-3">
              <FaInstagram className="w-4 h-4" />@{handle}
            </div>
          )}
          {title && (
            <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-normal tracking-tight text-foreground mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[1rem] text-neutral-500">{subtitle}</p>
          )}
        </div>

        {/* ── Grid ── */}
        {!ready ? (
          <SkeletonGrid count={maxItems} gap={gap} />
        ) : (
          <div
            className="grid mx-auto w-full max-w-7xl px-4"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", gap }}
          >
            {items.map((item, i) => (
              <Tile
                key={item.id}
                item={item}
                index={i}
                hovered={hoveredId === item.id}
                onEnter={() => setHoveredId(item.id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => openModal(i)}
              />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex flex-col items-center gap-2 mt-8 px-6">
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 text-[0.78rem] tracking-[0.12em] uppercase text-foreground border-b border-current pb-0.5 transition-opacity duration-200 hover:opacity-50"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[0.78rem] tracking-[0.12em] uppercase text-foreground">
              {ctaLabel}
            </span>
          )}
        </div>
      </section>

      {/* ── Modal ── */}
      {modalIndex !== null && (
        <GalleryModal
          items={items}
          activeIndex={modalIndex}
          onClose={closeModal}
          onPrev={prevModal}
          onNext={nextModal}
        />
      )}
    </>
  );
}
