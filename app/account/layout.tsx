import type { Metadata } from "next";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "My account",
  robots: privatePageRobots,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
