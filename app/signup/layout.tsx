import type { Metadata } from "next";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create account",
  robots: privatePageRobots,
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
