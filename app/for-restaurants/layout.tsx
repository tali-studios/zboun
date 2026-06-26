import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { formatPricingSummary } from "@/lib/pricing";

const pricingSummary = formatPricingSummary();

export const metadata: Metadata = {
  title: "For stores — pricing & subscribe",
  description:
    `Zboun for stores: digital storefront page, QR codes, flyer export, WhatsApp order formatting, and dashboard. Plans from ${pricingSummary}.`,
  alternates: { canonical: "/for-restaurants" },
  openGraph: {
    title: "Zboun for stores",
    description: `Digital storefront, QR tools, and WhatsApp orders. Simple pricing from ${pricingSummary}.`,
    url: `${getSiteUrl()}/for-restaurants`,
  },
};

export default function ForRestaurantsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
