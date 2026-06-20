import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Zboun — digital menus & WhatsApp ordering",
  description:
    "Learn what Zboun is, how it works for restaurants and diners, and every feature included — digital menus, QR codes, WhatsApp orders, and more. No account needed to explore.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Zboun",
    description:
      "Digital menus and WhatsApp ordering for restaurants. Browse features, benefits for owners and guests, and how to get started.",
    url: `${getSiteUrl()}/about`,
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
