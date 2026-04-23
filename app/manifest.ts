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
      { src: "/Favicon.svg?v=4", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/Favicon.svg?v=4", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    categories: ["food", "business"],
    id: base,
  };
}
