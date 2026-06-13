import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isRestaurantDashboardBlocked } from "@/lib/subscription-lifecycle";

/** Redirect restaurant admins when their business subscription is deactivated. */
export async function requireActiveRestaurant(restaurantId: string) {
  const blocked = await isRestaurantDashboardBlocked(restaurantId);

  if (blocked === true) {
    redirect("/dashboard/login?error=account_deactivated");
  }

  if (blocked === null) {
    // Service role missing — fall back to user client (may not see inactive rows due to RLS).
    const supabase = await createServerSupabaseClient();
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("is_active")
      .eq("id", restaurantId)
      .maybeSingle();

    if (restaurant && !restaurant.is_active) {
      redirect("/dashboard/login?error=account_deactivated");
    }
  }
}
