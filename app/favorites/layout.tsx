import type { Metadata } from "next";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Favorites",
  robots: privatePageRobots,
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
