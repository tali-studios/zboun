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
    background_color: "#f8fafc",
    theme_color: "#059669",
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    categories: ["food", "business"],
    id: base,
  };
}
