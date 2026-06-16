import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Add Zboun to your home screen",
  description:
    "Scan the QR code or follow simple steps to install Zboun on your phone home screen — browse menus and order faster.",
  alternates: { canonical: "/install" },
  openGraph: {
    title: "Add Zboun to your home screen",
    description: "Install the Zboun web app on your phone in seconds.",
    url: `${siteUrl}/install`,
  },
  robots: { index: true, follow: true },
};

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
