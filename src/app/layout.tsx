import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import PromoBanner from "@/features/navigation/ui/promo-banner";
import { SiteHeader } from "@/features/navigation/ui/site-header";
import { AppProviders } from "@/shared/providers/app-providers";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Suspense } from "react";
import ScrollToTop from "@/features/navigation/ui/scroll-to-top";
import { SiteFooter } from "@/features/navigation/ui/site-footer";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title:
    "LSA HOME | Premium Mattresses, Bedding, Pillows, Towels & Home Essentials",
  description:
    "Discover luxury bed and bath products at LSA HOME. Shop premium mattresses, pillows, duvets, towels, bedding sets, home fragrances, and high-quality home essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ScrollToTop />
          <AuthProvider>
            <AppProviders>
              <QueryProvider>
                <PromoBanner />
                {/* Make the WHOLE header sticky */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
                  <SiteHeader />
                </header>

                {/* With sticky you usually don't need extra padding */}
                <main className="min-h-screen">{children}</main>
                <SiteFooter />
              </QueryProvider>
            </AppProviders>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
