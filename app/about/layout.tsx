import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Zboun — digital storefronts & WhatsApp ordering",
  description:
    "Learn what Zboun is, how it works for stores and shoppers, and every feature included — digital catalogs, QR codes, WhatsApp orders, and more. No account needed to explore.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Zboun",
    description:
      "Digital storefronts and WhatsApp ordering for local businesses. Browse features, benefits for owners and guests, and how to get started.",
    url: `${getSiteUrl()}/about`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
