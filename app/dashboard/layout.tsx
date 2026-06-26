import type { Metadata } from "next";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: privatePageRobots,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
