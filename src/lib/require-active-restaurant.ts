import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enforceSubscriptionExpiryForRestaurant } from "@/lib/subscription-lifecycle";

/** Redirect restaurant admins when their business subscription is deactivated. */
export async function requireActiveRestaurant(restaurantId: string) {
  await enforceSubscriptionExpiryForRestaurant(restaurantId);

  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("is_active, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (restaurant && !restaurant.is_active) {
    redirect("/dashboard/login?error=account_deactivated");
  }
}
