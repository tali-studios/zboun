import type { Metadata } from "next";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";
import { NutritionAnalyzer } from "@/components/nutrition-analyzer";

export const metadata: Metadata = {
  title: "Nutrition AI",
  description: "Estimate calories, protein, carbs, and fat from a food photo or description.",
};

export default function NutritionPage() {
  return (
    <div className="min-h-screen bg-white">
      <CustomerDesktopNav title="Nutrition AI" />
      <CustomerMobileTopBar title="Nutrition AI" />

      <main className="px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 md:pb-14 md:pt-8">
        <NutritionAnalyzer />
      </main>

      <CustomerMobileFooterNav />
    </div>
  );
}
