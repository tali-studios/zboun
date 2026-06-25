import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { ZBOUN_PRICING } from "@/lib/pricing";

const monthlyPriceLabel = `${ZBOUN_PRICING.symbol}${ZBOUN_PRICING.monthly}/month`;

export const metadata: Metadata = {
  title: "For restaurants — pricing & subscribe",
  description:
    `Zboun for restaurants: digital menu page, QR codes, flyer export, WhatsApp order formatting, and dashboard. Plans from ${monthlyPriceLabel}.`,
  alternates: { canonical: "/for-restaurants" },
  openGraph: {
    title: "Zboun for restaurants",
    description: `Digital menu, QR tools, and WhatsApp orders. Simple pricing from ${monthlyPriceLabel}.`,
    url: `${getSiteUrl()}/for-restaurants`,
  },
};

export default function ForRestaurantsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
