"use client";

import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/lsa.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl">
          Elevate Your Home Comfort
        </h1>

        <p className="mt-4 max-w-lg text-xl md:text-4xl text-white/90 drop-shadow">
          Premium home essentials made with sustainable materials.
        </p>

        <Link
          href="/collections/new-arrivals"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-primary-foreground font-semibold hover:bg-primary-foreground hover:text-white transition"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
