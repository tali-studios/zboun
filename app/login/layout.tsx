import type { Metadata } from "next";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Customer login",
  robots: privatePageRobots,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
