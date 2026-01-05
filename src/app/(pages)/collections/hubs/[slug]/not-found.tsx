import Link from "next/link";
import { FaArrowLeft, FaMagnifyingGlass, FaStore } from "react-icons/fa6";

export default function NotFound() {
  return (
    <section className="mx-auto w-[95%] py-14 md:py-20">
      <div className="rounded-2xl border bg-background p-6 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <FaMagnifyingGlass className="h-3.5 w-3.5" />
              Page not found
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              This collection hub doesn’t exist
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              The link may be wrong, the hub may have been renamed, or it’s no
              longer available. Try browsing collections or return home.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/collections/latest"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <FaStore className="h-4 w-4" />
                Browse Collections
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <FaArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="w-full md:w-90">
            <div className="rounded-2xl border bg-muted/40 p-5">
              <p className="text-sm font-semibold text-foreground">
                Popular links
              </p>

              <div className="mt-3 grid gap-2">
                <Link
                  href="/collections/latest"
                  className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Latest arrivals
                </Link>
                <Link
                  href="/collections/all-beds"
                  className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Beds & sleep
                </Link>
                <Link
                  href="/collections/all-baths"
                  className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Bath essentials
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                If you think this is a mistake, try again from the collections
                page.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom subtle divider + helper */}
        <div className="mt-8 border-t pt-6 text-xs text-muted-foreground">
          Tip: Check the URL spelling, or navigate via{" "}
          <Link
            href="/collections/latest"
            className="underline underline-offset-4"
          >
            Collections
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
