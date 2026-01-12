import Script from "next/script";
import { StorefrontAnalyticsIntegration } from "../types/analytics.types";

export default function AnalyticsScripts({
  integrations,
}: {
  integrations: StorefrontAnalyticsIntegration[];
}) {
  const isEnabled = (x: StorefrontAnalyticsIntegration) => x.enabled ?? true;

  const ga4 = integrations.find((x) => x.provider === "ga4" && isEnabled(x));
  const meta = integrations.find(
    (x) => x.provider === "meta_pixel" && isEnabled(x)
  );

  return (
    <>
      {/* GA4 */}
      {ga4?.publicConfig?.measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
              ga4.publicConfig.measurementId
            )}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4.publicConfig.measurementId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {/* Meta */}
      {meta?.publicConfig?.pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${meta.publicConfig.pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}
