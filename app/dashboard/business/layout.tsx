import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { requireActiveRestaurant } from "@/lib/require-active-restaurant";

export const dynamic = "force-dynamic";

export default async function BusinessDashboardLayout({ children }: { children: ReactNode }) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const restaurantId = appUser.restaurant_id;
  await requireActiveRestaurant(restaurantId);
  return children;
}
