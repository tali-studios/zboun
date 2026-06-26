import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch to list your store on Zboun, subscribe to a plan, or ask about digital storefronts and WhatsApp ordering.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Zboun",
    description: "Reach the Zboun team about store onboarding and subscriptions.",
    url: `${getSiteUrl()}/contact`,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
