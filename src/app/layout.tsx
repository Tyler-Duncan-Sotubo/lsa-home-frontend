import { Montserrat, Dosis } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/shared/providers/app-providers";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Suspense } from "react";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { SiteFooter } from "@/features/Footer/site-footer";
import { AnalyticsTagLoader } from "@/shared/analytics/analytics-tag-loader";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { ThemeProvider } from "@/config/theme/ThemeProvider";
import { HeaderComposition } from "@/features/Header/composition/header-composition";
import { QuoteSheet } from "@/features/quote/ui/quote-sheet";
import { Toaster } from "@/shared/ui/sonner";
import { RuntimeConfigHydrator } from "@/config/runtime/RuntimeConfigHydrator";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const dosis = Dosis({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-dosis",
});

const ANALYTICS_TAG_TOKEN = process.env.NEXT_PUBLIC_ANALYTICS_TAG_TOKEN ?? null;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getStorefrontConfig();
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${dosis.variable} antialiased`}>
        <ThemeProvider theme={config.theme} />
        <Suspense fallback={<div>Loading...</div>}>
          <ScrollToTop />
          <AuthProvider>
            <AppProviders>
              <QueryProvider>
                <AnalyticsTagLoader token={ANALYTICS_TAG_TOKEN} />
                <QuoteSheet />
                <HeaderComposition config={config} />
                <RuntimeConfigHydrator config={config} />
                <main className="min-h-dvh">{children}</main>
                <SiteFooter config={config} />
                <Toaster position="top-right" />
              </QueryProvider>
            </AppProviders>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
