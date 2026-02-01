"use client";

type Slide = {
  text: string;
  link?: { label: string; href: string };
};

type Props = {
  slides: Slide[];
  autoplay?: {
    enabled?: boolean;
    intervalMs?: number; // duration for one loop
  };
};

export default function PromoBanner({ slides, autoplay }: Props) {
  if (!slides?.length) return null;

  const hasMultiple = slides.length > 1;
  const durationMs = autoplay?.intervalMs ?? 20000;

  // ✅ Single slide: show once, no marquee duplication
  if (!hasMultiple || autoplay?.enabled === false) {
    const s = slides[0];
    return (
      <div className="w-full bg-primary text-secondary overflow-hidden">
        <div className="relative mx-auto max-w-[60%]">
          <div className="flex h-10 items-center justify-center px-4 text-center text-[10px] md:text-[12px] font-semibold tracking-wide">
            <span>{s.text}</span>
            {s.link && (
              <a href={s.link.href} className="ml-2 underline hover:opacity-80">
                {s.link.label}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Multiple slides: duplicate for seamless loop
  const items = [...slides, ...slides];

  return (
    <div className="w-full bg-primary text-secondary overflow-hidden">
      {/* viewport constrained to ~60% */}
      <div className="relative mx-auto overflow-hidden max-w-[60%]">
        {/* moving track */}
        <div
          className="flex whitespace-nowrap marquee hover:paused"
          style={{ animationDuration: `${durationMs}ms` }}
        >
          {items.map((slide, i) => (
            <div
              key={i}
              className="flex h-10 items-center px-4 text-xs md:text-[12px] font-semibold tracking-wide"
            >
              <span>{slide.text}</span>
              {slide.link && (
                <a
                  href={slide.link.href}
                  className="ml-2 underline hover:opacity-80"
                >
                  {slide.link.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
