import { formatPricingSummary } from "@/lib/pricing";
import { getSiteUrl } from "@/lib/site";

/** Organization + WebSite structured data for search engines and rich results. */
export function SiteJsonLd() {
  const url = getSiteUrl();
  const pricing = formatPricingSummary();
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Zboun",
        url,
        logo: `${url}/icon-512.png`,
        description:
          `Digital restaurant and store menus with WhatsApp ordering in Lebanon. Subscription plans for owners from ${pricing}; no commission on customer orders.`,
        areaServed: {
          "@type": "Country",
          name: "Lebanon",
        },
        sameAs: [url],
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: "Zboun",
        url,
        description:
          "Browse local restaurant and store menus, order on WhatsApp, and discover businesses near you.",
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        name: "Zboun",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          description: `Restaurant and store menu platform — ${pricing}`,
        },
        url,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
