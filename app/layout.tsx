import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteJsonLd } from "@/components/site-json-ld";
import { env } from "@/lib/env";
import { getMetadataBase, getSiteUrl } from "@/lib/site";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#090c1b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Zboun — Restaurant menus & WhatsApp orders",
    template: "%s | Zboun",
  },
  description:
    "Browse restaurant digital menus and send clear orders on WhatsApp. For restaurants: menu page, QR codes, flyer tools, and dashboard from $25/month — no commission on orders.",
  applicationName: "Zboun",
  keywords: [
    "WhatsApp food order",
    "digital menu",
    "restaurant menu online",
    "QR menu",
    "Zboun",
    "Lebanon restaurant",
    "order food WhatsApp",
  ],
  authors: [{ name: "Zboun" }],
  creator: "Zboun",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Zboun",
    title: "Zboun — Restaurant menus & WhatsApp orders",
    description:
      "Browse menus and order on WhatsApp. Restaurant tools: digital menu, QR, dashboard — $25/month.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zboun — Restaurant menus & WhatsApp orders",
    description:
      "Browse menus and order on WhatsApp. Digital menus for restaurants from $25/month.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/Favicon.svg?v=6", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192.png?v=6", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png?v=6", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/icon-192.png?v=6"],
    apple: [{ url: "/apple-touch-icon.png?v=6", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
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
      <head>
        <link rel="icon" href="/Favicon.svg?v=6" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon-192.png?v=6" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=6" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png?v=6" />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteJsonLd />
        {children}
      </body>
    </html>
  );
}