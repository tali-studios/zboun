import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const base = getSiteUrl();
  return {
    name: "Zboun — Restaurant menus & WhatsApp orders",
    short_name: "Zboun",
    description: "Browse restaurant menus and order on WhatsApp. Digital menus for restaurants.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f8ff",
    theme_color: "#7854ff",
    icons: [
      { src: "/icon-192.png?v=6", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=6", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png?v=6", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-touch-icon.png?v=6", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["food", "business"],
    id: base,
  };
}
