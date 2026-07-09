import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { SiteJsonLd } from "@/components/site-json-ld";
import { PwaRegister } from "@/components/pwa-register";
import { env } from "@/lib/env";
import { getMetadataBase, getSiteUrl } from "@/lib/site";
import { publicPageRobots } from "@/lib/seo";
import { formatPricingSummary } from "@/lib/pricing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const pricingSummary = formatPricingSummary();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#090c1b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Zboun — Store menus & WhatsApp orders",
    template: "%s | Zboun",
  },
  description:
    `Browse store menus and send clear orders on WhatsApp. For store owners: storefront page, QR codes, flyer tools, and dashboard from ${pricingSummary} — no commission on orders.`,
  applicationName: "Zboun",
  keywords: [
    "WhatsApp food order",
    "digital menu",
    "store menu online",
    "QR menu",
    "Zboun",
    "Lebanon stores",
    "order food WhatsApp",
    "grocery delivery Lebanon",
    "store menu online",
    "store ordering app",
    "menu without commission",
  ],
  authors: [{ name: "Zboun" }],
  creator: "Zboun",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zboun",
    title: "Zboun — Store menus & WhatsApp orders",
    description:
      `Browse menus and order on WhatsApp. Store tools: digital menu, QR, dashboard — ${pricingSummary}.`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Zboun — Store menus & WhatsApp orders",
    description:
      `Browse menus and order on WhatsApp. Digital storefronts for stores from ${pricingSummary}.`,
  },
  robots: publicPageRobots,
  icons: {
    icon: [
      { url: "/icon.svg?v=10", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png?v=10", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png?v=10", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/icon-192.png?v=10", "/icon.svg?v=10"],
    apple: [{ url: "/apple-touch-icon.png?v=9", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Zboun",
    statusBarStyle: "default",
  },
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
    : {}),
  ...(env.bingSiteVerification
    ? {
        other: {
          "msvalidate.01": env.bingSiteVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PwaRegister />
        <NextTopLoader color="#7c3aed" showSpinner={false} />
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}