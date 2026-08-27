import type { Metadata } from "next";
import { formatPricingSummary } from "@/lib/pricing";
import { getSiteUrl } from "@/lib/site";

const pricingSummary = formatPricingSummary();

export const metadata: Metadata = {
  title: "For stores — pricing & subscribe",
  description: `Zboun for stores: digital storefront page, QR codes, flyer export, WhatsApp order formatting, and dashboard. Plans from ${pricingSummary}.`,
  alternates: { canonical: "/for-stores" },
  openGraph: {
    title: "Zboun for stores",
    description: `Digital storefront, QR tools, and WhatsApp orders. Simple pricing from ${pricingSummary}.`,
    url: `${getSiteUrl()}/for-stores`,
  },
};

export default function ForStoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
