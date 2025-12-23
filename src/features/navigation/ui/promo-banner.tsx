"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    text: (
      <>
        Big Sale! Get 20% OFF on all items — Today Only!{" "}
        <a href="/sale" className="underline font-semibold hover:opacity-80">
          Shop now
        </a>
      </>
    ),
  },
  {
    text: (
      <>
        Free shipping on orders over $50!{" "}
        <a
          href="/shipping"
          className="underline font-semibold hover:opacity-80"
        >
          Learn more
        </a>
      </>
    ),
  },
  {
    text: (
      <>
        Buy 2 Get 1 Free on selected items this weekend!{" "}
        <a href="/offers" className="underline font-semibold hover:opacity-80">
          See offer
        </a>
      </>
    ),
  },
];

export default function PromoBanner() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(next, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-primary-foreground text-white p-4">
      <section className="flex items-center md:w-1/2 mx-auto">
        <button
          type="button"
          onClick={prev}
          className="p-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

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
                <p className="font-medium tracking-wide text-center text-xs md:text-sm">
                  {slide.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          className="p-1 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
