import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "For restaurants — pricing & subscribe",
  description:
    "Zboun for restaurants: digital menu page, QR codes, flyer export, WhatsApp order formatting, and dashboard. Plans from $20/month.",
  alternates: { canonical: "/for-restaurants" },
  openGraph: {
    title: "Zboun for restaurants",
    description: "Digital menu, QR tools, and WhatsApp orders. Simple pricing from $20/month.",
    url: `${getSiteUrl()}/for-restaurants`,
  },
};

export default function ForRestaurantsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
