import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch to list your restaurant on Zboun, subscribe to a plan, or ask about digital menus and WhatsApp ordering.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Zboun",
    description: "Reach the Zboun team about restaurant onboarding and subscriptions.",
    url: `${getSiteUrl()}/contact`,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
