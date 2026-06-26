import { getSiteUrl } from "@/lib/site";

type RestaurantForJsonLd = {
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  logo_url: string | null;
  location: string | null;
};

/** Restaurant / store structured data for menu pages. */
export function RestaurantJsonLd({ restaurant }: { restaurant: RestaurantForJsonLd }) {
  const base = getSiteUrl();
  const url = `${base}/${restaurant.slug}`;
  const payload = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url,
    ...(restaurant.description?.trim() ? { description: restaurant.description.trim() } : {}),
    ...(restaurant.logo_url ? { image: restaurant.logo_url } : {}),
    ...(restaurant.phone ? { telephone: restaurant.phone } : {}),
    ...(restaurant.location?.trim()
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: restaurant.location.trim(),
            addressCountry: "LB",
          },
        }
      : {}),
    servesCuisine: "Various",
    potentialAction: {
      "@type": "OrderAction",
      target: url,
      deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
