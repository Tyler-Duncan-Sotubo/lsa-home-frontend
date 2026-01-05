/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  text: string;
  link?: {
    label: string;
    href: string;
  };
};

type Props = {
  slides: Slide[];
  autoplay?: {
    enabled: boolean;
    intervalMs?: number;
  };
};

export default function PromoBanner({ slides, autoplay }: Props) {
  const [index, setIndex] = useState(0);

  const hasMultipleSlides = slides.length > 1;

  const next = () => setIndex((prev) => (prev + 1) % slides.length);

  const prev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!autoplay?.enabled || !hasMultipleSlides) return;

    const interval = setInterval(next, autoplay.intervalMs ?? 10000);

    return () => clearInterval(interval);
  }, [autoplay, hasMultipleSlides]);

  if (!slides.length) return null;

  return (
    <div className="w-full bg-primary text-secondary p-3">
      <section className="flex items-center md:w-1/2 mx-auto">
        {hasMultipleSlides && (
          <button
            type="button"
            onClick={prev}
            className="p-1 rounded-full  hover:bg-primary-foreground/20 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 overflow-hidden">
          <div
            className="whitespace-nowrap transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="inline-flex w-full justify-center items-center"
              >
                <p className="font-bold tracking-wide text-center text-xs md:text-[12px]  space-x-2">
                  {slide.text}
                  {slide.link && (
                    <a
                      href={slide.link.href}
                      className="underline font-semibold hover:opacity-80"
                    >
                      {slide.link.label}
                    </a>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {hasMultipleSlides && (
          <button
            type="button"
            onClick={next}
            className="p-1 rounded-full hover:bg-primary-foreground/20 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </section>
    </div>
  );
}
