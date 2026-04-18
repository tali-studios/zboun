import { getSiteUrl } from "@/lib/site";

/** Organization + WebSite structured data for search engines. */
export function SiteJsonLd() {
  const url = getSiteUrl();
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Zboun",
        url,
        description:
          "Digital restaurant menus and structured WhatsApp ordering. Subscription plans for restaurant owners.",
      },
      {
        "@type": "WebSite",
        name: "Zboun",
        url,
        description: "Browse restaurant menus and order on WhatsApp.",
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
