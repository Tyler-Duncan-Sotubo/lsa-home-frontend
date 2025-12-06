import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";
import { Link } from "react-scroll";

export function Rating({
  rating,
  reviews,
}: {
  rating: number;
  reviews: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <Link
      to="reviews-section" // 👈 target name
      smooth={true}
      duration={500}
      offset={-100} // tweak for header height
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const index = i + 1;
          if (index <= full)
            return (
              <HiMiniStar key={i} className="h-3.5 w-3.5 text-yellow-400" />
            );
          if (index === full + 1 && half)
            return (
              <HiMiniStar
                key={i}
                className="h-3.5 w-3.5 text-yellow-400 opacity-60"
              />
            );
          return <HiOutlineStar key={i} className="h-3.5 w-3.5" />;
        })}
      </div>
      <span>{rating.toFixed(1)}</span>
      <span>({reviews})</span>
    </Link>
  );
}
