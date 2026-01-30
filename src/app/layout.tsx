export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Montserrat, Dosis } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/shared/providers/app-providers";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { QueryProvider } from "@/shared/providers/query-provider";
import { Suspense } from "react";
import ScrollToTop from "@/shared/ui/scroll-to-top";
import { SiteFooter } from "@/features/layout/Footer/site-footer";
import { AnalyticsTagLoader } from "@/shared/analytics/analytics-tag-loader";
import { getStorefrontConfig } from "@/config/runtime/get-storefront-config";
import { ThemeProvider } from "@/config/theme/ThemeProvider";
import { HeaderComposition } from "@/features/layout/Header/composition/header-composition";
import { QuoteSheet } from "@/features/quote/ui/quote-sheet";
import { Toaster } from "@/shared/ui/sonner";
import { RuntimeConfigHydrator } from "@/config/runtime/RuntimeConfigHydrator";
import { getStorefrontAnalyticsIntegrations } from "@/features/integrations/actions/get-analytics-integrations";
import AnalyticsScripts from "@/features/integrations/ui/analytics-scripts";
import { SystemPageClient } from "@/features/not-found/store-not-found-client";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getStorefrontConfig();
  const integrations = await getStorefrontAnalyticsIntegrations();

  const isSystemPage = !!config.ui?.systemPage;

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${dosis.variable} antialiased min-h-dvh flex flex-col`}
      >
        <ThemeProvider theme={config.theme} />

        <AuthProvider>
          <AppProviders>
            <QueryProvider>
              {!isSystemPage && <AnalyticsTagLoader />}
              {!isSystemPage && (
                <AnalyticsScripts integrations={integrations} />
              )}

              {!isSystemPage && <QuoteSheet />}
              {!isSystemPage && <HeaderComposition config={config} />}
              <RuntimeConfigHydrator config={config} />

              <Suspense fallback={<div>Loading...</div>}>
                <main className="flex-1">
                  <ScrollToTop />
                  {isSystemPage ? (
                    <SystemPageClient config={config} />
                  ) : (
                    children
                  )}
                </main>
              </Suspense>

              {!isSystemPage && <SiteFooter config={config} />}
              <Toaster position="top-right" />
            </QueryProvider>
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
